import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import { buildApiUrl } from '../lib/apiBase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  layer?: string;
  structured?: StructuredResponse;
  followUps?: string[];
  recipeSuggestions?: string[];
}

interface StructuredResponse {
  recipe_name: string;
  description: string;
  ingredients?: string[];
  steps?: string[];
  prep_time?: string;
  cook_time?: string;
  nutrition?: string[];
  flavor_tags?: string[];
  follow_ups?: string[];
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const parseStructuredResponse = (raw: string | null | undefined) => {
    if (!raw) return undefined;
    const trimmed = raw.trim();

    if (!trimmed.startsWith('{')) return undefined;

    try {
      const parsed = JSON.parse(trimmed);
      if (!parsed || typeof parsed.description !== 'string') return undefined;

      const normalizeList = (value: unknown) =>
        Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];

      return {
        recipe_name: typeof parsed.recipe_name === 'string' ? parsed.recipe_name : '',
        description: parsed.description,
        ingredients: normalizeList(parsed.ingredients),
        steps: normalizeList(parsed.steps),
        prep_time: typeof parsed.prep_time === 'string' ? parsed.prep_time : '',
        cook_time: typeof parsed.cook_time === 'string' ? parsed.cook_time : '',
        nutrition: normalizeList(parsed.nutrition),
        flavor_tags: normalizeList(parsed.flavor_tags),
        follow_ups: normalizeList(parsed.follow_ups)
      } as StructuredResponse;
    } catch (error) {
      return undefined;
    }
  };

  const formatFallbackContent = (raw: string | null | undefined) => {
    if (!raw) return '';

    let sanitized = raw.replace(/<[^>]+>/g, '');
    sanitized = sanitized.replace(/\r\n/g, '\n');
    return sanitized.trim();
  };

  const buildPlainTextFromStructured = (structured: StructuredResponse) => {
    const sections = [] as string[];

    if (structured.recipe_name) sections.push(`Recipe: ${structured.recipe_name}`);
    if (structured.description) sections.push(`Description: ${structured.description}`);
    if (structured.prep_time) sections.push(`Prep time: ${structured.prep_time}`);
    if (structured.cook_time) sections.push(`Cook time: ${structured.cook_time}`);

    const appendList = (label: string, items?: string[]) => {
      if (!items || items.length === 0) return;
      sections.push(`${label}: ${items.join('; ')}`);
    };

    appendList('Ingredients', structured.ingredients);
    appendList('Steps', structured.steps);
    appendList('Nutrition', structured.nutrition);
    appendList('Flavor tags', structured.flavor_tags);

    return sections.join(' ');
  };

  const buildHistoryPayload = (currentMessages: Message[]) =>
    currentMessages.slice(-6).map(msg => ({
      role: msg.role,
      content: msg.structured ? buildPlainTextFromStructured(msg.structured) : msg.content
    }));

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message when opening
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: '👋 Hello! I\'m Kaulam, your Filipino food assistant. Ask me anything about recipes, cooking techniques, ingredients, or food culture!',
          timestamp: new Date(),
          layer: 'Welcome'
        }
      ]);
    }
  }, [isOpen]);

  const handleSendMessage = async (overrideValue?: string) => {
    if (isLoading) return;
    const messageToSend = (overrideValue ?? inputValue).trim();
    if (!messageToSend) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send to backend
      const history = buildHistoryPayload(messages);
      const response = await fetch(buildApiUrl('/chatbot/ask'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageToSend,
          history
        })
      });

      const data = await response.json();

      const structured = parseStructuredResponse(data?.message);
      const fallbackContent = formatFallbackContent(data?.message);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: structured?.description || fallbackContent || (data?.message || 'Sorry, I did not receive a response.'),
        timestamp: new Date(),
        layer: data.layer,
        structured: structured ?? undefined,
        followUps: structured?.follow_ups,
        recipeSuggestions: Array.isArray(data?.recipeSuggestions)
          ? data.recipeSuggestions.filter((item: unknown) => typeof item === 'string')
          : []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        layer: 'Error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chatbot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          title="Chat with Kaulam"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl flex flex-col w-96 h-[500px] border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Kaulam</h3>
              <p className="text-sm opacity-90">Filipino Food Assistant</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id} className="space-y-2">
                <div
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-orange-500 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    {msg.structured ? (
                      <div className="text-sm leading-relaxed space-y-2">
                        {msg.structured.recipe_name && (
                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-600">Recipe</p>
                            <p>{msg.structured.recipe_name}</p>
                          </div>
                        )}

                        {msg.structured.description && (
                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-600">Description</p>
                            <p>{msg.structured.description}</p>
                          </div>
                        )}

                        {(msg.structured.prep_time || msg.structured.cook_time) && (
                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-600">Time</p>
                            <p>
                              {msg.structured.prep_time && `Prep: ${msg.structured.prep_time}`}
                              {msg.structured.prep_time && msg.structured.cook_time && ' | '}
                              {msg.structured.cook_time && `Cook: ${msg.structured.cook_time}`}
                            </p>
                          </div>
                        )}

                        {msg.structured.ingredients && msg.structured.ingredients.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-600">Ingredients</p>
                            <ul className="list-disc pl-5">
                              {msg.structured.ingredients.map((item, index) => (
                                <li key={`${msg.id}-ing-${index}`}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {msg.structured.steps && msg.structured.steps.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-600">Step by step</p>
                            <ol className="list-decimal pl-5">
                              {msg.structured.steps.map((item, index) => (
                                <li key={`${msg.id}-step-${index}`}>{item}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {msg.structured.nutrition && msg.structured.nutrition.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-600">Nutrition</p>
                            <ul className="list-disc pl-5">
                              {msg.structured.nutrition.map((item, index) => (
                                <li key={`${msg.id}-nut-${index}`}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {msg.structured.flavor_tags && msg.structured.flavor_tags.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-600">Flavor tags</p>
                            <div className="flex flex-wrap gap-2">
                              {msg.structured.flavor_tags.map((item, index) => (
                                <span
                                  key={`${msg.id}-tag-${index}`}
                                  className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                    )}
                    {msg.layer && msg.role === 'assistant' && (
                      <p className="text-xs opacity-60 mt-1">({msg.layer})</p>
                    )}
                  </div>
                </div>

                {msg.role === 'assistant' && msg.followUps && msg.followUps.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-start">
                    {msg.followUps.map((followUp, index) => (
                      <button
                        key={`${msg.id}-followup-${index}`}
                        type="button"
                        onClick={() => handleSendMessage(followUp)}
                        className="text-xs px-3 py-1 rounded-full border border-orange-200 text-orange-700 hover:bg-orange-50"
                      >
                        {followUp}
                      </button>
                    ))}
                  </div>
                )}

                {msg.role === 'assistant' && msg.recipeSuggestions && msg.recipeSuggestions.length > 0 && (
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">Published recipes:</span>{' '}
                    {msg.recipeSuggestions.join(', ')}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
                  <Loader size={16} className="animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about Filipino recipes, cooking, ingredients..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition duration-200"
              >
                <Send size={20} />
              </button>
            </div>

            {/* Info Message */}
            <p className="text-xs text-gray-500 mt-2 text-center">
              🔒 Kaulam only answers food-related questions
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
