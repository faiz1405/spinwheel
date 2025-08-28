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
        {/* Confetti pieces dari pojok kiri bawah */}
        {Array.from({ length: 75 }).map((_, index) => (
          <div
            key={`left-${index}`}
            className={`confetti-piece confetti-${index % 8} confetti-left`}
            style={{
              left: `${Math.random() * 30}%`, // Hanya di area kiri (0-30%)
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              width: `${8 + Math.random() * 8}px`,
              height: `${8 + Math.random() * 8}px`,
            }}
          />
        ))}

        {/* Confetti pieces dari pojok kanan bawah */}
        {Array.from({ length: 75 }).map((_, index) => (
          <div
            key={`right-${index}`}
            className={`confetti-piece confetti-${index % 8} confetti-right`}
            style={{
              left: `${70 + Math.random() * 30}%`, // Hanya di area kanan (70-100%)
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              width: `${8 + Math.random() * 8}px`,
              height: `${8 + Math.random() * 8}px`,
            }}
          />
        ))}

        {/* Sparkles dari pojok kiri bawah */}
        {Array.from({ length: 25 }).map((_, index) => (
          <div
            key={`sparkle-left-${index}`}
            className="sparkle sparkle-left"
            style={{
              left: `${Math.random() * 30}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Sparkles dari pojok kanan bawah */}
        {Array.from({ length: 25 }).map((_, index) => (
          <div
            key={`sparkle-right-${index}`}
            className="sparkle sparkle-right"
            style={{
              left: `${70 + Math.random() * 30}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Fireworks dari pojok kiri bawah */}
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`firework-left-${index}`}
            className="firework firework-left"
            style={{
              left: `${10 + (index * 5)}%`,
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

        {/* Fireworks dari pojok kanan bawah */}
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`firework-right-${index}`}
            className="firework firework-right"
            style={{
              left: `${80 + (index * 5)}%`,
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
      </div>
    </>
  );
};

export default Confetti;
