import React, { useState, useEffect } from 'react';

interface SplitFlapProps {
  text: string;
  className?: string;
  from?: string;
  speed?: number;
  shouldAnimate?: boolean;
  onAnimationComplete?: () => void;
}

const SplitFlap: React.FC<SplitFlapProps> = ({ 
  text, 
  className = "", 
  speed = 50,
  shouldAnimate = false,
  from = 'id',
  onAnimationComplete
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flippingIndices, setFlippingIndices] = useState<Set<number>>(new Set());

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789? ';

  // This effect syncs the display text with the text prop
  // ONLY when an animation is not in progress.
  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayText(text);
    }
  }, [text, shouldAnimate]);

  // This effect handles the animation logic itself.
  useEffect(() => {
    if (!shouldAnimate) {
      setIsAnimating(false);
      return;
    }
    
    setIsAnimating(true);
    let animationCancelled = false;
    
    const animateText = async () => {
      try {
        // Tunggu sebentar setelah tombol diklik untuk efek dramatis
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (animationCancelled) return;
        
        // Mulai semua karakter flip bersamaan
        const allCharacterAnimations = text.split('').map(async (char, i) => {
          if (animationCancelled) return;
          
          const targetChar = char.toUpperCase();
          
          // Setiap karakter akan berhenti pada waktu yang berbeda
          // Karakter pertama berhenti lebih cepat, yang terakhir paling lama
          // Pastikan minimum delay 50ms antar karakter untuk efek visual yang jelas
          const minDelayPerChar = 1000; // Minimum 50ms antar karakter
          const actualDelay = Math.max(speed, minDelayPerChar);
          const stopDelay = i * actualDelay;
          const flipDuration = 200 + stopDelay; // Base duration lebih cepat
          
          const startTime = Date.now();
          let lastFlipTime = startTime;
          let hasStopped = false;
          
          // Loop flip terus menerus sampai waktu berhenti tiba
          while (Date.now() - startTime < flipDuration && !animationCancelled && !hasStopped) {
            // Flip setiap 50ms (lebih cepat)
            if (Date.now() - lastFlipTime >= 50) {
              const isTimeToStop = Date.now() - startTime >= flipDuration - 50;
              
              // Mulai efek flip animation sebelum karakter berubah
              setFlippingIndices(prev => new Set(prev).add(i));
              
              // Tunggu setengah durasi flip (30ms untuk animasi turun)
              await new Promise(resolve => setTimeout(resolve, 30));
              
              // Tentukan karakter yang akan ditampilkan
              const charToShow = isTimeToStop ? 
                targetChar : 
                characters[Math.floor(Math.random() * characters.length)];
              
              // Update karakter di tengah animasi flip
              setDisplayText(prev => prev.substring(0, i) + charToShow + prev.substring(i + 1));
              
              // Tunggu sisa durasi flip (30ms untuk animasi naik)
              await new Promise(resolve => setTimeout(resolve, 30));
              
              // Hentikan efek flip animation
              setFlippingIndices(prev => {
                const newSet = new Set(prev);
                newSet.delete(i);
                return newSet;
              });
              
              lastFlipTime = Date.now();
              
              // Jika sudah waktunya berhenti, keluar dari loop dan tandai sebagai stopped
              if (isTimeToStop) {
                hasStopped = true;
                break;
              }
            }
            
            // Interval kecil untuk check time
            await new Promise(resolve => setTimeout(resolve, 10));
          }
          
          // Pastikan karakter final ditampilkan dengan benar setelah loop selesai
          if (!animationCancelled) {
            setDisplayText(prev => prev.substring(0, i) + targetChar + prev.substring(i + 1));
          }
        });
        
        // Tunggu semua karakter selesai
        await Promise.allSettled(allCharacterAnimations);

        if (!animationCancelled) {
          setIsAnimating(false);
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }
      } catch (error) {
        // Handle any errors during animation
        setIsAnimating(false);
      }
    };

    animateText();
    
    // Cleanup function to cancel animation if component unmounts or shouldAnimate changes
    return () => {
      animationCancelled = true;
    };
  }, [text, speed, shouldAnimate]);

  return (
    <div className={`split-flap-display ${className}`}>
      <div className={`split-flap-content-${from}`}>
        {displayText.split('').map((char, index) => (
          <div 
            key={index} 
            className={`split-flap-char ${flippingIndices.has(index) ? 'flipping' : ''}`}
          >
            <div className="flap-container">
              <div className="flap-top">
                <span className="char-content">{char}</span>
              </div>
              <div className="flap-bottom">
                <span className="char-content">{char}</span>
              </div>
              <div className="flap-fold-top">
                <span className="char-content">{char}</span>
              </div>
              <div className="flap-fold-bottom">
                <span className="char-content">{char}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SplitFlap;
