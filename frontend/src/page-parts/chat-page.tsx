'use client';

import { useState } from 'react';
import { MarkdownRenderer } from '@/components/markdown';
import { backendUrl } from '@/env';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm a chatbot.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { text: input, sender: 'user' }]);
    setInput('');

    const response = await fetch(`${backendUrl}/ai-message/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input , session_id: localStorage.getItem("session_id") || "" }),
    })
    const responseText = await response.text();

    setMessages(prev => [...prev, { text: responseText, sender: 'bot' }]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Chatbot</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 px-10 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-lg ${
              msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
            }`}>
              <MarkdownRenderer content={msg.text} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 border-t">
        <form onSubmit={handleSend} className="flex gap-2 px-16">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
