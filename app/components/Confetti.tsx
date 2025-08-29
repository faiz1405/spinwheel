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
        {/* Confetti pieces dari atas */}
        {Array.from({ length: 150 }).map((_, index) => (
          <div
            key={`top-${index}`}
            className={`confetti-piece confetti-${index % 8} confetti-top`}
            style={{
              left: `${Math.random() * 100}%`, // Sebar di seluruh lebar layar
              top: '-20px', // Mulai dari atas layar
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              width: `${8 + Math.random() * 12}px`,
              height: `${8 + Math.random() * 12}px`,
            }}
          />
        ))}

        {/* Sparkles dari atas */}
        {Array.from({ length: 50 }).map((_, index) => (
          <div
            key={`sparkle-top-${index}`}
            className="sparkle sparkle-top"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-20px',
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Fireworks dari atas */}
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`firework-top-${index}`}
            className="firework firework-top"
            style={{
              left: `${10 + (index * 10)}%`,
              top: '-20px',
              animationDelay: `${index * 0.5}s`,
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
      </div>
    </>
  );
};

export default Confetti;
