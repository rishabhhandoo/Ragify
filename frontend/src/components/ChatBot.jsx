// src/components/ChatBot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiX, FiTrash } from 'react-icons/fi';
import { useChat } from '../context/ChatContext';

const ChatBot = () => {
  const { messages, sendMessage, toggleChat, clearChat, isLoading } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-4 right-4 w-[95%] max-w-md h-[500px] md:h-[600px] bg-neutral-darkest/90 backdrop-blur border border-primary-light/30 
      rounded-2xl overflow-hidden shadow-lg flex flex-col z-50"
    >
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b border-primary-light/20 bg-neutral-dark/50">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-primary-light animate-pulse mr-3"></div>
          <h3 className="text-lg font-japanese text-primary-light text-glow">ネオ日本 アシスタント</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={clearChat}
            className="text-neutral-light hover:text-primary-light p-1 rounded"
            aria-label="Clear chat"
          >
            <FiTrash size={18} />
          </button>
          <button 
            onClick={toggleChat}
            className="text-neutral-light hover:text-primary-light p-1 rounded"
            aria-label="Close chat"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-2xl shadow-md message-animation
                  ${message.sender === 'user' 
                    ? 'bg-primary-dark text-primary-light border border-primary-light/30' 
                    : 'bg-neutral-dark text-neutral-light border border-neutral-light/10'
                  }`}
              >
                <p className="text-sm md:text-base">{message.text}</p>
                <span className="text-xs opacity-50 mt-1 block text-right">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start mb-4"
            >
              <div className="bg-neutral-dark text-neutral-light rounded-2xl p-3 shadow-md max-w-[80%] flex items-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '250ms' }}></div>
                  <div className="w-2 h-2 bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '500ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-primary-light/20 bg-neutral-dark/50">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Neo Japan..."
            className="flex-1 bg-neutral-darkest text-neutral-lightest rounded-l-full px-4 py-2 outline-none
            border border-primary-light/30 focus:border-primary-light/70 transition-colors duration-300"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`bg-primary-dark text-primary-light p-2 rounded-r-full
            border border-primary-light/30 border-l-0 hover:bg-primary transition-colors duration-300
            ${(!input.trim() || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Send message"
          >
            <FiSend size={20} />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ChatBot;