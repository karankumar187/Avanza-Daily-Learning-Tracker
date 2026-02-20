import React, { useState } from 'react';
import { aiAPI } from '../services/api';
import { toast } from 'sonner';
import { Sparkles, BookOpen, Loader2 } from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat({ prompt: userMessage.content });
      const reply = res.data?.data?.reply || "I couldn't generate a detailed reply, please try asking again.";
      const aiMessage = { role: 'assistant', content: reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to get AI response');
      const aiMessage = {
        role: 'assistant',
        content: 'Sorry, something went wrong while contacting the AI. Please try again.',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">AI Chatbot</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Chat with an AI learning coach for quick guidance and ideas.
            </p>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="glass-card rounded-2xl p-6 flex flex-col h-[70vh] max-h-[700px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Conversation
          </h3>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Clear chat
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <div className="text-center max-w-xs">
                <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-70" />
                <p className="text-sm">
                  Ask about how to plan your study, break down objectives, or stay consistent.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-indigo-500'
                      : 'bg-indigo-100 dark:bg-indigo-900/40'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <BookOpen className="w-4 h-4 text-white" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div className="flex-1 rounded-2xl px-4 py-3 bg-gray-100 dark:bg-slate-800">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the AI anything about your learning..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;

