// src/pages/LandingPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ChatBot from '../components/ChatBot';
import ParallaxScene from '../components/ParallaxScene';
import ChatButton from '../components/ChatButton';
import { useChat } from '../context/ChatContext';

const LandingPage = () => {
  const { isOpen } = useChat();
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 0.7, 0.4, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  
  // Refs for each section
  const [section1Ref, section1InView] = useInView({
    threshold: 0.3,
    triggerOnce: false
  });
  
  const [section2Ref, section2InView] = useInView({
    threshold: 0.3,
    triggerOnce: false
  });
  
  const [section3Ref, section3InView] = useInView({
    threshold: 0.3,
    triggerOnce: false
  });

  return (
    <div className="relative w-full bg-neutral-darkest overflow-hidden">
      {/* Scrollable container */}
      <div ref={scrollRef} className="h-[300vh]">
        {/* Fixed parallax landscape that changes as you scroll */}
        <div className="fixed inset-0 h-screen w-full">
          <motion.div 
            style={{ opacity, scale }}
            className="w-full h-full"
          >
            <ParallaxScene scrollYProgress={scrollYProgress} />
          </motion.div>
        </div>

        {/* Content sections that appear as you scroll */}
        <div className="relative pt-screen">
          {/* Section 1 */}
          <motion.section 
            ref={section1Ref}
            initial={{ opacity: 0, y: 50 }}
            animate={section1InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
          >
            <div className="max-w-4xl mx-auto text-center backdrop-blur bg-neutral-darkest/30 p-8 rounded-2xl">
              <h2 className="font-japanese text-4xl md:text-6xl mb-6 text-primary-light text-glow">
                古代と未来の調和
              </h2>
              <p className="text-xl md:text-2xl mb-6 font-display text-neutral-lightest">
                Harmony of Ancient and Future
              </p>
              <p className="text-lg md:text-xl text-neutral-light">
                Where traditional Japanese landscapes meet the glow of neon futures. 
                A world where waterfalls cascade alongside digital streams, and mountain 
                silhouettes stand against holographic skies.
              </p>
            </div>
          </motion.section>

          {/* Section 2 */}
          <motion.section 
            ref={section2Ref}
            initial={{ opacity: 0, y: 50 }}
            animate={section2InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
          >
            <div className="max-w-4xl mx-auto text-center backdrop-blur bg-neutral-darkest/30 p-8 rounded-2xl">
              <h2 className="font-japanese text-4xl md:text-6xl mb-6 text-accent-light text-glow-accent">
                水と光の物語
              </h2>
              <p className="text-xl md:text-2xl mb-6 font-display text-neutral-lightest">
                Tale of Water and Light
              </p>
              <p className="text-lg md:text-xl text-neutral-light">
                Our digital waters flow eternally, carrying ancient wisdom into a 
                luminous future. The boundary between natural and artificial dissolves
                as technology and tradition find their perfect balance.
              </p>
            </div>
          </motion.section>

          {/* Section 3 */}
          <motion.section 
            ref={section3Ref}
            initial={{ opacity: 0, y: 50 }}
            animate={section3InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
          >
            <div className="max-w-4xl mx-auto text-center backdrop-blur bg-neutral-darkest/30 p-8 rounded-2xl">
              <h2 className="font-japanese text-4xl md:text-6xl mb-6 text-primary-light text-glow">
                導きのアシスタント
              </h2>
              <p className="text-xl md:text-2xl mb-6 font-display text-neutral-lightest">
                Guiding Assistant
              </p>
              <p className="text-lg md:text-xl text-neutral-light mb-10">
                Our digital guide awaits to answer your questions about this Neo-Japan 
                landscape. Explore the fusion of time-honored traditions and cutting-edge 
                innovation through conversation.
              </p>
              <button 
                onClick={() => document.getElementById('chat-toggle-btn').click()}
                className="px-8 py-3 bg-primary-dark text-primary-light border border-primary-light rounded-full 
                hover:bg-primary text-lg transition-all duration-300 shadow-neon"
              >
                Begin Your Journey
              </button>
            </div>
          </motion.section>
        </div>
      </div>

      {/* Chat components */}
      <ChatButton id="chat-toggle-btn" />
      {isOpen && <ChatBot />}
    </div>
  );
};

export default LandingPage;