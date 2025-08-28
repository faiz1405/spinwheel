import React, { useState, useEffect } from 'react';

interface ConfettiProps {
  isActive: boolean;
}

// Type declaration untuk CustomEvent
declare global {
  interface WindowEventMap {
    confettiToggle: CustomEvent<{ enabled: boolean }>;
  }
}

const Confetti: React.FC<ConfettiProps> = ({ isActive }) => {
  const [confettiEnabled, setConfettiEnabled] = useState(true);

  // Load confetti setting from localStorage
  useEffect(() => {
    const savedSetting = localStorage.getItem('confettiEnabled');
    if (savedSetting !== null) {
      setConfettiEnabled(JSON.parse(savedSetting));
    }
  }, []);

  // Listen for confetti toggle events
  useEffect(() => {
    const handleConfettiToggle = (event: CustomEvent) => {
      setConfettiEnabled(event.detail.enabled);
    };

    window.addEventListener('confettiToggle', handleConfettiToggle as EventListener);
    
    return () => {
      window.removeEventListener('confettiToggle', handleConfettiToggle as EventListener);
    };
  }, []);

  // Don't render if confetti is disabled or not active
  if (!isActive || !confettiEnabled) return null;

  return (
    <>

      {/* Confetti Container */}
      <div className="confetti-container">
        {/* Burst Effects
        <div className="confetti-burst" style={{ left: '20%' }}></div>
        <div className="confetti-burst" style={{ left: '50%', animationDelay: '0.2s' }}></div>
        <div className="confetti-burst" style={{ left: '80%', animationDelay: '0.4s' }}></div>
         */}
        {/* Confetti pieces */}
        {Array.from({ length: 150 }).map((_, index) => (
          <div
            key={index}
            className={`confetti-piece confetti-${index % 8}`}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              width: `${8 + Math.random() * 8}px`,
              height: `${8 + Math.random() * 8}px`,
            }}
          />
        ))}

        {/* Sparkles */}
        {Array.from({ length: 50 }).map((_, index) => (
          <div
            key={`sparkle-${index}`}
            className="sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Fireworks */}
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`firework-${index}`}
            className="firework"
            style={{
              left: `${20 + (index * 10)}%`,
              animationDelay: `${index * 0.3}s`,
            }}
          >
            {Array.from({ length: 12 }).map((_, particleIndex) => (
              <div
                key={particleIndex}
                className="firework-particle"
                style={{
                  transform: `rotate(${particleIndex * 30}deg)`,
                }}
              />
            ))}
          </div>
        ))}

        {/* Celebration Text */}
        {/* <div className="celebration-text">🎉</div>
        <div className="celebration-text">🎊</div>
        <div className="celebration-text">🎈</div>
        <div className="celebration-text">🎆</div> */}
      </div>
    </>
  );
};

export default Confetti;
