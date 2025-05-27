import React, { useState, useEffect } from 'react';

const ParallaxScene = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate transform values based on scroll progress
  const skyOpacity = 1 - (scrollProgress * 0.8);
  const mountainFarY = scrollProgress * 10;
  const mountainMidY = scrollProgress * 15;
  const mountainCloseY = scrollProgress * 20;
  const waterfallScale = 1 + (scrollProgress * 0.2);
  const treesY = scrollProgress * 5;
  const futuristicElementsOpacity = Math.min(0.2 + (scrollProgress * 0.8), 1);
  const futuristicElementsScale = 0.9 + (scrollProgress * 0.2);
  const moonTop = 100 - (scrollProgress * 80);
  const moonOpacity = Math.min(scrollProgress * 2, 1);
  const starsOpacity = Math.min(scrollProgress * 1.5, 1);
  
  // Sky gradient calculation
  const getSkyGradient = () => {
    if (scrollProgress < 0.5) {
      return 'linear-gradient(to bottom, #1e40af 0%, #3b82f6 50%, #93c5fd 100%)';
    } else if (scrollProgress < 1) {
      return 'linear-gradient(to bottom, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)';
    } else {
      return 'linear-gradient(to bottom, #0f172a 0%, #1e293b 50%, #334155 100%)';
    }
  };

  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes waterFlow {
          0% { transform: translateY(-10px); opacity: 0.8; }
          50% { transform: translateY(0px); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0.8; }
        }
        
        @keyframes floating {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        .twinkle { animation: twinkle 3s infinite; }
        .water-animation { animation: waterFlow 2s infinite; }
        .floating { animation: floating 3s infinite; }
        .pulse-glow { animation: pulse 2s infinite; }
        
        .neon-glow {
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4);
        }
        
        .neon-glow-accent {
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.8), 0 0 20px rgba(236, 72, 153, 0.6), 0 0 30px rgba(236, 72, 153, 0.4);
        }
      `}</style>
      
      <div className="h-screen w-full overflow-hidden relative">
        {/* Sky that changes from day to night */}
        <div 
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: getSkyGradient(),
            opacity: skyOpacity
          }}
        />

        {/* Stars that appear as you scroll (night effect) */}
        <div 
          className="absolute inset-0"
          style={{ opacity: starsOpacity }}
        >
          {Array.from({ length: 100 }).map((_, i) => {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = Math.random() * 2 + 1;
            const opacity = Math.random() * 0.7 + 0.3;
            const animationDelay = Math.random() * 5;
            
            return (
              <div 
                key={i}
                className="absolute bg-white rounded-full twinkle"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity: opacity,
                  animationDelay: `${animationDelay}s`
                }}
              />
            );
          })}
        </div>

        {/* Moon that rises as you scroll */}
        <div 
          className="absolute rounded-full bg-gray-100 transition-all duration-300"
          style={{
            width: '120px',
            height: '120px',
            boxShadow: '0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 255, 255, 0.4)',
            top: `${moonTop}%`,
            right: '15%',
            opacity: moonOpacity
          }}
        >
          {/* Moon craters */}
          <div className="absolute top-4 left-6 w-3 h-3 bg-gray-300 rounded-full opacity-50" />
          <div className="absolute top-8 right-4 w-2 h-2 bg-gray-300 rounded-full opacity-30" />
          <div className="absolute bottom-6 left-8 w-4 h-4 bg-gray-300 rounded-full opacity-40" />
        </div>

        {/* Far mountains */}
        <div
          className="absolute w-full bottom-0 transition-transform duration-75"
          style={{ transform: `translateY(${mountainFarY}%)` }}
        >
          <div className="absolute bottom-0 w-full h-80">
            <div className="absolute inset-0 bg-gray-700 opacity-70" 
                 style={{ clipPath: "polygon(0% 40%, 10% 35%, 20% 45%, 30% 30%, 40% 50%, 50% 25%, 60% 40%, 70% 45%, 80% 30%, 90% 50%, 100% 35%, 100% 100%, 0% 100%)" }}
            />
          </div>
        </div>

        {/* Mid mountains */}
        <div
          className="absolute w-full bottom-0 transition-transform duration-75"
          style={{ transform: `translateY(${mountainMidY}%)` }}
        >
          <div className="absolute bottom-0 w-full h-96">
            <div className="absolute inset-0 bg-gray-800 opacity-80" 
                 style={{ clipPath: "polygon(0% 50%, 8% 45%, 15% 60%, 25% 40%, 35% 65%, 45% 50%, 55% 70%, 65% 45%, 75% 60%, 85% 45%, 95% 65%, 100% 50%, 100% 100%, 0% 100%)" }}
            />
          </div>
        </div>

        {/* Close mountains */}
        <div
          className="absolute w-full bottom-0 transition-transform duration-75"
          style={{ transform: `translateY(${mountainCloseY}%)` }}
        >
          <div className="absolute bottom-0 w-full h-[500px]">
            <div className="absolute inset-0 bg-black opacity-90" 
                 style={{ clipPath: "polygon(0% 70%, 5% 65%, 10% 75%, 15% 60%, 20% 80%, 25% 70%, 30% 65%, 35% 75%, 40% 65%, 45% 80%, 50% 60%, 55% 75%, 60% 65%, 65% 85%, 70% 70%, 75% 80%, 80% 65%, 85% 75%, 90% 65%, 95% 80%, 100% 70%, 100% 100%, 0% 100%)" }}
            />
          </div>
        </div>

        {/* Waterfall */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 bottom-0 transition-transform duration-75"
          style={{ 
            transform: `translateX(-50%) scale(${waterfallScale})`,
          }}
        >
          <div className="relative w-52 h-[600px]">
            {/* Waterfall main stream */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-10 water-animation opacity-70">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-200/20 via-blue-300/60 to-blue-400/80 rounded-sm" />
            </div>
            
            {/* Waterfall side streams */}
            <div className="absolute left-1/2 transform -translate-x-[70%] top-[10%] bottom-0 w-4 water-animation opacity-40">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-200/10 via-blue-300/40 to-blue-400/60 rounded-sm" />
            </div>
            
            <div className="absolute left-1/2 transform -translate-x-[30%] top-[20%] bottom-0 w-5 water-animation opacity-50">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-200/10 via-blue-300/40 to-blue-400/60 rounded-sm" />
            </div>
            
            {/* Waterfall splash */}
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-12">
              <div className="absolute inset-0 bg-blue-300/60 rounded-full blur-md water-animation" />
              <div className="absolute inset-2 bg-blue-200/40 rounded-full blur-sm water-animation" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>

        {/* Traditional Japanese trees */}
        <div
          className="absolute w-full bottom-0 transition-transform duration-75"
          style={{ transform: `translateY(${treesY}%)` }}
        >
          {/* Stylized cherry blossom tree left */}
          <div className="absolute bottom-[15%] left-[20%]">
            <div className="w-1 h-24 bg-gray-800 rounded-sm"></div>
            <div className="absolute bottom-20 left-[-40px] w-20 h-20 rounded-full bg-pink-400 opacity-50 blur-sm"></div>
            <div className="absolute bottom-24 left-[-30px] w-14 h-14 rounded-full bg-pink-300 opacity-40 blur-sm"></div>
            <div className="absolute bottom-28 left-[-20px] w-10 h-10 rounded-full bg-pink-200 opacity-30 blur-sm"></div>
            {/* Petals floating */}
            <div className="absolute bottom-16 left-[-10px] w-2 h-2 bg-pink-400 rounded-full floating opacity-60" />
            <div className="absolute bottom-20 left-[10px] w-1 h-1 bg-pink-300 rounded-full floating opacity-50" style={{ animationDelay: '1s' }} />
          </div>
          
          {/* Stylized cherry blossom tree right */}
          <div className="absolute bottom-[10%] right-[25%]">
            <div className="w-1 h-28 bg-gray-800 rounded-sm"></div>
            <div className="absolute bottom-24 left-[-50px] w-24 h-24 rounded-full bg-pink-400 opacity-50 blur-sm"></div>
            <div className="absolute bottom-28 left-[-35px] w-16 h-16 rounded-full bg-pink-300 opacity-40 blur-sm"></div>
            <div className="absolute bottom-32 left-[-25px] w-12 h-12 rounded-full bg-pink-200 opacity-30 blur-sm"></div>
            {/* Petals floating */}
            <div className="absolute bottom-20 left-[-15px] w-2 h-2 bg-pink-400 rounded-full floating opacity-60" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        {/* Futuristic elements */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{ 
            opacity: futuristicElementsOpacity,
            transform: `scale(${futuristicElementsScale})`,
          }}
        >
          {/* Tech circles with glowing effect */}
          <div className="absolute top-[20%] left-[15%]">
            <div className="w-20 h-20 rounded-full border border-blue-400 opacity-20 pulse-glow"></div>
            <div className="absolute inset-0 w-14 h-14 m-auto rounded-full border border-blue-400 opacity-40 pulse-glow"></div>
            <div className="absolute inset-0 w-10 h-10 m-auto rounded-full border border-blue-400 opacity-60 neon-glow pulse-glow"></div>
          </div>
          
          <div className="absolute top-[30%] right-[20%]">
            <div className="w-24 h-24 rounded-full border border-pink-400 opacity-20 pulse-glow" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-0 w-16 h-16 m-auto rounded-full border border-pink-400 opacity-40 pulse-glow" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-0 w-10 h-10 m-auto rounded-full border border-pink-400 opacity-60 neon-glow-accent pulse-glow" style={{ animationDelay: '1s' }}></div>
          </div>
          
          {/* Horizontal lines */}
          <div className="absolute bottom-[30%] w-full h-px bg-blue-400 opacity-20 pulse-glow"></div>
          <div className="absolute bottom-[32%] w-full h-px bg-blue-400 opacity-10 pulse-glow" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Glowing dots */}
          {Array.from({ length: 20 }).map((_, i) => {
            const x = Math.random() * 100;
            const y = Math.random() * 40 + 10; // Top half of the screen
            const size = Math.random() * 3 + 2;
            const isBlue = Math.random() > 0.5;
            const color = isBlue ? 'bg-blue-400' : 'bg-pink-400';
            const shadow = isBlue ? 'neon-glow' : 'neon-glow-accent';
            
            return (
              <div 
                key={i}
                className={`absolute ${color} ${shadow} rounded-full floating`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            );
          })}
        </div>
        
        {/* Japanese torii gate silhouette */}
        <div
          className="absolute bottom-[5%] left-[65%] transform -translate-x-1/2 transition-all duration-75"
          style={{ 
            transform: `translateX(-50%) translateY(${scrollProgress * 3}%) scale(${1 + scrollProgress * 0.05})`,
          }}
        >
          <div className="relative h-28 w-24">
            <div className="absolute top-0 w-28 h-3 left-[-8px] bg-pink-600 opacity-80 rounded-sm shadow-lg"></div>
            <div className="absolute top-4 w-24 h-2 left-0 bg-pink-500 opacity-70 rounded-sm shadow-md"></div>
            <div className="absolute top-0 bottom-0 left-1 w-2 bg-pink-600 opacity-90 rounded-sm shadow-lg"></div>
            <div className="absolute top-0 bottom-0 right-1 w-2 bg-pink-600 opacity-90 rounded-sm shadow-lg"></div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 text-sm font-light">
          Scroll to see the day-to-night transition
        </div>
      </div>
    </>
  );
};

// Demo wrapper with scroll simulation
const ParallaxDemo = () => {
  return (
    <div style={{ height: '300vh' }}>
      <div className="fixed inset-0">
        <ParallaxScene />
      </div>
    </div>
  );
};

export default ParallaxDemo;