// Chatbot Kaulam - 3-Layer Filtering System for Food-Related Questions Only

import fs from 'fs';
import path from 'path';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'qwen/qwen3-next-80b-a3b-instruct:free';
const DEFAULT_OPENROUTER_MODELS = [
  OPENROUTER_MODEL,
  'meta-llama/llama-3.3-70b-instruct:free',
  'minimax/minimax-m2.5:free'
];

function getOpenRouterModelCandidates() {
  const fallbackModels = (process.env.OPENROUTER_FALLBACK_MODELS || '')
    .split(',')
    .map(model => model.trim())
    .filter(Boolean);

  return [...new Set([
    OPENROUTER_MODEL,
    ...fallbackModels,
    ...DEFAULT_OPENROUTER_MODELS
  ])];
}

function formatRateLimitMessage(metadata) {
  const retryAfterSeconds = Number(metadata?.retry_after_seconds);

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    const roundedSeconds = Math.max(1, Math.ceil(retryAfterSeconds));

    if (roundedSeconds < 60) {
      return `The free model is busy right now. Please wait about ${roundedSeconds} seconds and try again.`;
    }

    const minutes = Math.ceil(roundedSeconds / 60);
    return `The free model is busy right now. Please wait about ${minutes} minute${minutes === 1 ? '' : 's'} and try again.`;
  }

  return 'The free model is busy right now. Please wait a couple of minutes and try again.';
}

async function requestOpenRouterCompletion(model, userMessage, historyMessages, systemPrompt = SYSTEM_PROMPT) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const metadata = error?.error?.metadata || {};
    const errorMessage = error.error?.message || `API request failed with status ${response.status}`;

    return {
      success: false,
      rateLimited: response.status === 429,
      retryAfterSeconds: metadata.retry_after_seconds,
      message: errorMessage,
      error,
      status: response.status,
      model
    };
  }

  const data = await response.json();
  const assistantMessage = data?.choices?.[0]?.message?.content || null;

  return {
    success: true,
    message: assistantMessage,
    model
  };
}

// ===================== LAYER 1: SYSTEM PROMPT =====================
// Behavior layer - keeps the model aligned with food-related responses
const SYSTEM_PROMPT = `You are Kaulam, a friendly Filipino food assistant powered by ProCook.
Your role is to help users with Filipino recipes, cooking techniques, ingredients, nutrition, and food culture.

IMPORTANT GUIDELINES:
- ONLY answer questions related to food, cooking, recipes, ingredients, nutrition, and culinary topics
- For Filipino cuisine, provide detailed, authentic information
- If someone asks about non-food topics, politely redirect them: "I'm Kaulam, a food assistant. I can only help with cooking and recipe questions. Would you like to know about any Filipino recipes or cooking tips?"
- Be helpful, friendly, and authentic in your responses
- Keep responses concise and actionable

RESPONSE FORMAT RULES:
1. Recipe Description
- If the user asks for a recipe description, overview, or introduction:
  - Write in paragraph format only.
  - Make it appetizing, descriptive, and concise.
  - Do NOT use bullet points for descriptions.

2. Ingredients Section
- If the user asks for ingredients:
  - Use bullet-point formatting.
  - Include exact measurements and units.
  - Organize ingredients into categories if necessary.

3. Cooking Instructions
- If the user asks for cooking steps or process:
  - Use numbered formatting.
  - Each step must be separated by spacing.
  - Never place multiple major cooking actions in one line.
  - Keep instructions beginner-friendly and easy to follow.

4. Estimated Cooking Time
Always provide:
- Preparation Time
- Cooking Time
- Total Time

5. Flavor Profile
Always include a flavor profile section.

6. Optional Sections
When appropriate, also include:
- Difficulty Level
- Estimated Cost
- Best Served With
- Storage Tips
- Substitutions
- Nutrition Labels

INTENT RULES:
1. Recipe Name Request
- If the user mentions a specific recipe name, provide the FULL recipe with all sections.

2. Ingredient-Based Request
- Recommend the best-matching dish and briefly explain why it matches.

3. Flavor-Based Request
- Recommend recipes with matching flavor profiles.

4. Mood-Based Request
- Recommend recipes associated with the mood and briefly explain why.

RELATED RECIPE SUGGESTION RULE:
After EVERY response, suggest at least one related recipe from the database and ask:
"There is also a related recipe that matches your request. Would you like to see it?"

FORMATTING STYLE:
- Use clear headings.
- Add spacing between sections.
- Avoid large text walls.
- Make responses easy to scan on mobile devices.

IMPORTANT:
- Never return unstructured responses.
- Never combine all cooking steps into one paragraph.`;

// ===================== LAYER 2: INPUT FILTER =====================
// Frontend/backend guard - blocks irrelevant queries early

const LINE_TRIM_REGEX = /^#+\s+|^[-*]\s+|^\d+\.\s+/g;
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
const VARIANT_SPLIT_REGEX = /\s+\/\s+|\s+\/|\/\s+|\s+\(|\)\s+|\s+,\s+|\s+—\s+|\s+-\s+/;

function normalizeKeywordLine(line) {
  return line
    .replace(LINE_TRIM_REGEX, '')
    .replace(/"/g, '')
    .replace(EMOJI_REGEX, '')
    .trim();
}

function addKeywordVariants(keywordSet, rawPart) {
  if (!rawPart || rawPart === '---' || rawPart.length < 2) return;

  rawPart
    .split(VARIANT_SPLIT_REGEX)
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(variant => {
      if (variant.length < 2 || variant.length > 120) return;
      keywordSet.add(variant.toLowerCase());
    });
}

function loadFoodKeywordsFromFile() {
  try {
    const keywordPath = path.resolve(process.cwd(), 'Keywords.md');
    if (!fs.existsSync(keywordPath)) return [];

    const content = fs.readFileSync(keywordPath, 'utf8');
    const keywords = new Set();

    content.split(/\r?\n/).forEach(rawLine => {
      const line = rawLine.trim();
      if (!line || line.startsWith('---')) return;

      const stripped = normalizeKeywordLine(line);
      if (!stripped) return;

      stripped
        .split('|')
        .map(part => part.trim())
        .filter(Boolean)
        .forEach(part => addKeywordVariants(keywords, part));
    });

    return Array.from(keywords);
  } catch (error) {
    console.warn('Failed to load Keywords.md:', error);
    return [];
  }
}

// Keywords that indicate food-related questions
const BASE_FOOD_KEYWORDS = [
  'recipe', 'cook', 'ingredient', 'dish', 'meal', 'food', 'cuisine',
  'prepare', 'make', 'cooking', 'bake', 'fry', 'boil', 'steam',
  'spice', 'flavor', 'taste', 'restaurant', 'Filipino', 'tagalog',
  'nutrition', 'calorie', 'protein', 'carb', 'diet', 'healthy',
  'adobo', 'sinigang', 'lumpia', 'pancit', 'bibingka', 'leche flan',
  'substitute', 'preparation', 'technique', 'kitchen',
  'knife', 'pot', 'pan', 'utensil', 'seasoning', 'sauce', 'gravy'
];

const FOOD_KEYWORDS = Array.from(new Set([
  ...BASE_FOOD_KEYWORDS.map(keyword => keyword.toLowerCase()),
  ...loadFoodKeywordsFromFile()
]));

// Keywords that indicate non-food questions
const NON_FOOD_KEYWORDS = [
  'weather', 'politics', 'sports', 'movie', 'game', 'music', 'math',
  'history', 'science', 'technology', 'coding', 'programming',
  'love', 'relationship', 'dating', 'work', 'job', 'car', 'travel',
  'homework', 'assignment', 'answer', 'solve', 'calculate'
];

const FOLLOW_UP_PHRASES = [
  'yes',
  'yeah',
  'yep',
  'please',
  'step by step',
  'steps',
  'full recipe',
  'full steps',
  'tips',
  'show me',
  'go ahead',
  'ok',
  'okay'
];

/**
 * Layer 2: Input Filter - Check if query is food-related
 * Returns { isValid: boolean, reason?: string }
 */
function validateInputQuery(query, options = {}) {
  const lowerQuery = query.toLowerCase().trim();
  const allowShort = Boolean(options.allowShort);
  const allowUncertain = Boolean(options.allowUncertain);

  // Allow common follow-ups even if they are short or vague
  const isFollowUpPhrase = FOLLOW_UP_PHRASES.some(phrase => lowerQuery.includes(phrase));

  if (isFollowUpPhrase) {
    return { isValid: true };
  }

  // If query is too short, reject
  if (lowerQuery.length < (allowShort ? 3 : 5)) {
    return {
      isValid: false,
      reason: 'Query too short. Please ask a more specific food-related question.'
    };
  }

  // Check for non-food keywords (strong rejection)
  const hasNonFoodKeyword = NON_FOOD_KEYWORDS.some(keyword =>
    lowerQuery.includes(keyword)
  );

  if (hasNonFoodKeyword) {
    return {
      isValid: false,
      reason: 'This question is not related to food or cooking.'
    };
  }

  // Check for food keywords (accept if found)
  const hasFoodKeyword = FOOD_KEYWORDS.some(keyword =>
    lowerQuery.includes(keyword)
  );

  if (hasFoodKeyword) {
    return { isValid: true };
  }

  // If no keywords, check for general cooking-related patterns
  if (
    lowerQuery.includes('how to') ||
    lowerQuery.includes('how do i') ||
    lowerQuery.includes('can i') ||
    lowerQuery.includes('what is') ||
    lowerQuery.includes('tell me about')
  ) {
    // Might be food-related, allow it through
    return { isValid: true };
  }

  // Otherwise, uncertain - request clarification
  if (allowUncertain) {
    return { isValid: true };
  }

  return {
    isValid: false,
    reason: 'I can only answer food and cooking related questions. Could you ask something about recipes or cooking?'
  };
}

// ===================== LAYER 3: OUTPUT FILTER =====================
// Response validation - checks model response before showing user

/**
 * Layer 3: Output Filter - Verify response quality and relevance
 * Returns { isValid: boolean, reason?: string }
 */
function validateOutputResponse(response) {
  if (!response || response.length < 10) {
    return {
      isValid: false,
      reason: 'Response was too short or empty.'
    };
  }

  const lowerResponse = response.toLowerCase();

  // Check if response contains suspicious content
  const suspiciousPatterns = [
    'sorry, i cannot discuss',
    'i cannot help with',
    'that\'s not related to food',
    'political', 'adult content', 'explicit',
    'i don\'t know about cooking'
  ];

  const hasSuspiciousPattern = suspiciousPatterns.some(pattern =>
    lowerResponse.includes(pattern)
  );

  if (hasSuspiciousPattern && !lowerResponse.includes('recipe')) {
    return {
      isValid: false,
      reason: 'Response validation failed.'
    };
  }

  return { isValid: true };
}

function sanitizeHistoryMessages(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(item => item && typeof item.content === 'string')
    .map(item => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: item.content
    }))
    .slice(-8);
}

// ===================== MAIN CHATBOT FUNCTION =====================

/**
 * Send message to Kaulam chatbot with 3-layer filtering
 * @param {string} userMessage - The user's question
 * @returns {Promise<{success: boolean, message: string, layer?: string}>}
 */
export async function chatWithKaulam(userMessage, history = []) {
  try {
    // LAYER 2: Input Filter
    console.log('🔍 Layer 2: Validating input query...');
    const historyMessages = sanitizeHistoryMessages(history);
    const allowFollowUp = historyMessages.length > 0;
    const inputValidation = validateInputQuery(userMessage, {
      allowShort: allowFollowUp,
      allowUncertain: allowFollowUp
    });

    if (!inputValidation.isValid) {
      return {
        success: false,
        message: inputValidation.reason,
        layer: 'Layer 2 - Input Filter'
      };
    }

    console.log('✅ Input validation passed');

    if (!OPENROUTER_API_KEY) {
      return {
        success: false,
        message: 'OPENROUTER_API_KEY is not configured on the server.',
        layer: 'System Error'
      };
    }

    const modelCandidates = getOpenRouterModelCandidates();
    let lastRateLimit = null;

    for (const model of modelCandidates) {
      console.log(`📡 Layer 1: Calling OpenRouter model ${model}...`);

      const completion = await requestOpenRouterCompletion(model, userMessage, historyMessages);

      if (completion.success) {
        const assistantMessage = completion.message;

        // LAYER 3: Output Filter
        console.log('🛡️ Layer 3: Validating output response...');
        const outputValidation = validateOutputResponse(assistantMessage);

        if (!outputValidation.isValid) {
          return {
            success: false,
            message: 'I can only answer with structured recipe sections. Please rephrase your request as a specific dish or recipe.',
            layer: 'Layer 3 - Output Filter'
          };
        }

        console.log('✅ Output validation passed');

        return {
          success: true,
          message: assistantMessage,
          model: model.split('/').pop() || model,
          layer: `All layers passed (${model})`
        };
      }

      console.error('OpenRouter error detail:', completion.error, 'status:', completion.status, 'model:', model);

      if (completion.rateLimited) {
        lastRateLimit = completion;
        continue;
      }

      throw new Error(`OpenRouter API error: ${completion.message} (check OPENROUTER_API_KEY and account permissions)`);
    }

    if (lastRateLimit) {
      return {
        success: false,
        message: formatRateLimitMessage(lastRateLimit.error?.error?.metadata),
        layer: 'Rate Limit'
      };
    }

    return {
      success: false,
      message: 'The chatbot is temporarily unavailable. Please try again in a few minutes.',
      layer: 'System Error'
    };
  } catch (error) {
    console.error('Chatbot error:', error);
    return {
      success: false,
      message: `Error: ${error.message}`,
      layer: 'System Error'
    };
  }
}

// Export for backend use
export default { chatWithKaulam, validateInputQuery, validateOutputResponse };
