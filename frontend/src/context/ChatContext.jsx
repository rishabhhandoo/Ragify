// src/context/ChatContext.jsx
import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome to Neo Japan. How may I assist you today?",
      sender: "bot",
      timestamp: new Date().toISOString()
    }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock API call function
  const sendMessage = async (text) => {
    if (!text.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text,
      sender: "user",
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response generation
      let response;
      
      if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
        response = "Hello! Welcome to Neo Japan. How can I help you explore our world?";
      } else if (text.toLowerCase().includes('japan') || text.toLowerCase().includes('japanese')) {
        response = "Japan is known for its unique blend of ancient traditions and futuristic technology. Our landscape brings this duality to life.";
      } else if (text.toLowerCase().includes('waterfall') || text.toLowerCase().includes('water')) {
        response = "The waterfalls you see represent the flow of time, connecting the traditional past with the technological future.";
      } else if (text.toLowerCase().includes('future') || text.toLowerCase().includes('technology')) {
        response = "The futuristic elements symbolize Japan's innovation and technological advancements, creating harmony with natural beauty.";
      } else {
        response = "Thank you for your interest. As you explore our Neo Japan landscape, feel free to ask about the waterfalls, mountains, technology, or any element you see.";
      }
      
      // Add bot response to chat
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: "bot",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: "I apologize, but I'm having trouble connecting. Please try again later.",
        sender: "bot",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Welcome to Neo Japan. How may I assist you today?",
        sender: "bot",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      sendMessage, 
      isOpen, 
      toggleChat, 
      clearChat,
      isLoading
    }}>
      {children}
    </ChatContext.Provider>
  );
};