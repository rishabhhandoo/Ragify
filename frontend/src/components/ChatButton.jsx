// src/components/ChatButton.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiMessageCircle, FiX } from 'react-icons/fi';
import { useChat } from '../context/ChatContext';

const ChatButton = ({ id }) => {
  const { isOpen, toggleChat } = useChat();

  return (
    <motion.button
      id={id}
      onClick={toggleChat}
      className="fixed bottom-6 right-6 w-14 h-14 bg-primary-dark text-primary-light rounded-full
      shadow-neon border border-primary-light/30 flex items-center justify-center z-40
      hover:bg-primary hover:scale-105 transition-all duration-300"
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      
      {/* Glowing ring effect */}
      <div className="absolute inset-0 rounded-full border border-primary-light/30 animate-ping opacity-30"></div>
    </motion.button>
  );
};

export default ChatButton;