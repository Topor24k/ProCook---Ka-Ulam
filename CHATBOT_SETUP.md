# Chatbot Kaulam - 3-Layer Filtering System

## Overview
Kaulam is an intelligent Filipino food assistant powered by ProCook that answers questions about recipes, cooking, ingredients, and food culture. The chatbot uses a sophisticated **3-layer filtering system** to ensure it only responds to food-related queries.

---

## 🏗️ Architecture: 3-Layer Filtering System

### **Layer 1: System Prompt (Behavior Alignment)**
**Location:** `src/lib/chatbotApi.js` - `SYSTEM_PROMPT`

The system prompt instructs the AI model to:
- Only answer food, cooking, and recipe-related questions
- Provide authentic Filipino cuisine information
- Politely redirect non-food questions
- Maintain a friendly and helpful tone

**Example:**
```
You are Kaulam, a friendly Filipino food assistant...
ONLY answer questions related to food, cooking, recipes, ingredients...
```

---

### **Layer 2: Input Filter (Query Validation)**
**Location:** `src/lib/chatbotApi.js` - `validateInputQuery()`

**Purpose:** Blocks irrelevant queries BEFORE calling the AI API

**How it works:**
1. **Keyword Detection:**
   - ✅ FOOD_KEYWORDS: recipe, cook, ingredient, Filipino, adobo, etc.
   - ❌ NON_FOOD_KEYWORDS: weather, politics, sports, coding, etc.

2. **Query Validation:**
   - Rejects queries shorter than 5 characters
   - Blocks queries with non-food keywords
   - Accepts queries with food keywords
   - Allows common cooking patterns ("how to", "can I", etc.)

**Example Flows:**
```javascript
// ✅ ALLOWED
validateInputQuery("How do I make adobo?")
// Returns: { isValid: true }

// ❌ BLOCKED
validateInputQuery("What's the weather?")
// Returns: { isValid: false, reason: 'This question is not related to food...' }
```

---

### **Layer 3: Output Filter (Response Validation)**
**Location:** `src/lib/chatbotApi.js` - `validateOutputResponse()`

**Purpose:** Verifies the AI response is appropriate before showing to user

**Checks:**
- Response length validation (minimum 10 characters)
- Detects suspicious content patterns
- Ensures response quality

**Example:**
```javascript
// ✅ VALID
validateOutputResponse("Adobo is a traditional Filipino dish...")
// Returns: { isValid: true }

// ❌ INVALID
validateOutputResponse("I don't know about cooking")
// Returns: { isValid: false, reason: 'Response validation failed' }
```

---

## 🗂️ File Structure

```
ProCook - KaUlam/
├── src/
│   ├── lib/
│   │   ├── chatbotApi.js          ⭐ Core chatbot logic (3-layer filtering)
│   │   ├── recipeApi.js
│   │   └── mongodb.js
│   ├── components/
│   │   ├── ChatbotWidget.tsx       ⭐ Frontend UI component
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── App.tsx                     ⭐ (Updated to include ChatbotWidget)
└── server.js                       ⭐ (Updated with /api/chatbot/ask endpoint)
```

---

## 🚀 How to Use

### **Backend: Chatbot Endpoint**

**Endpoint:** `POST /api/chatbot/ask`

**Request:**
```json
{
  "message": "How do I make sinigang?"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Sinigang is a Filipino sour stew...",
  "layer": "All layers passed",
  "timestamp": "2026-05-09T10:30:00.000Z"
}
```

**Response (Input Filter Blocked):**
```json
{
  "success": false,
  "message": "This question is not related to food or cooking.",
  "layer": "Layer 2 - Input Filter",
  "timestamp": "2026-05-09T10:30:00.000Z"
}
```

---

### **Frontend: ChatbotWidget Component**

The `ChatbotWidget` component is automatically available in the app.

**Features:**
- 💬 Floating chat button (bottom-right corner)
- 🎨 Gradient orange-to-red theme matching ProCook branding
- 📱 Responsive design
- ⌨️ Enter key to send, Shift+Enter for new line
- 🔄 Real-time message handling
- 📊 Layer information display

---

## 🔐 Security Features

1. **API Key Protection:**
   - Stored in `chatbotApi.js`
   - ⚠️ **IMPORTANT:** Rotate the API key in production
   - Use environment variables in production

2. **Query Validation:**
   - Prevents API abuse from non-food queries
   - Reduces API costs by filtering early

3. **Response Validation:**
   - Additional safety check before showing response
   - Ensures quality and relevance

---

## 📊 Testing the Chatbot

### Test Cases:

**✅ Should Work:**
- "How do I make Filipino adobo?"
- "What are the main ingredients in sinigang?"
- "Can you give me a recipe for lumpia?"
- "Tell me about Filipino cuisine"

**❌ Should Be Blocked:**
- "What's the weather today?"
- "Can you help with my math homework?"
- "What do you think about politics?"
- "How do I code in Python?"

---

## 🛠️ Configuration & Customization

### Modify Food Keywords
Edit in `src/lib/chatbotApi.js`:
```javascript
const FOOD_KEYWORDS = [
  'recipe', 'cook', 'ingredient', // Add more as needed
  'your_new_keyword', ...
];
```

### Change AI Model
Edit in `chatWithKaulam()`:
```javascript
model: 'qwen/qwen-2.5-7b-instruct:free', // Change model here
```

### Adjust System Prompt
Edit `SYSTEM_PROMPT` to change Kaulam's personality or guidelines.

---

## 🔧 API Integration Details

**Provider:** OpenRouter.ai  
**Model:** Qwen 2.5 7B Instruct (Free)  
**Base URL:** `https://openrouter.ai/api/v1/chat/completions`

**Request Headers:**
```javascript
{
  'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://procook.app',
  'X-Title': 'ProCook Kaulam'
}
```

---

## 📈 Performance Considerations

- **Layer 2 (Input Filter):** Fast keyword matching, blocks ~30-40% of irrelevant queries
- **API Call:** Only happens if Layer 2 passes
- **Layer 3 (Output Filter):** Minimal overhead, simple validation
- **Estimated Cost Reduction:** 30-40% fewer API calls due to early filtering

---

## ⚠️ Important Notes

1. **API Key Management:**
   - Current key is in code (development only)
   - Move to `.env` file in production
   - Rotate key periodically

2. **Rate Limiting:**
   - Consider adding rate limiting for production
   - Monitor OpenRouter API usage

3. **Error Handling:**
   - Frontend shows user-friendly error messages
   - Backend logs detailed errors

4. **Response Time:**
   - Typical response: 2-5 seconds
   - Display loading indicator while waiting

---

## 🎯 Future Enhancements

- [ ] Store chat history in MongoDB
- [ ] User preferences (diet restrictions, allergies)
- [ ] Multi-language support
- [ ] Recipe recommendations based on conversation
- [ ] Integration with recipe database
- [ ] Conversation context memory
- [ ] Admin dashboard for monitoring

---

## 📞 Support

For issues or questions about the chatbot implementation:
1. Check backend logs: `console.error()` statements
2. Check browser console: DevTools > Console
3. Verify API key is valid
4. Test endpoint: `curl -X POST http://localhost:3001/api/chatbot/ask -H "Content-Type: application/json" -d '{"message":"Hello"}'`

---

**Built with ❤️ for ProCook - KaUlam**
