import { useState, useEffect } from "react";
import ReactConfetti from "react-confetti";

interface ConfettiProps {
  show: boolean;
  duration?: number;
  onComplete?: () => void;
}

export const Confetti = ({ show, duration = 3000, onComplete }: ConfettiProps) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (show) {
      setIsActive(true);
      const timer = setTimeout(() => {
        setIsActive(false);
        if (onComplete) {
          onComplete();
        }
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!isActive) return null;

  return (
    <ReactConfetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      numberOfPieces={500}
      gravity={0.2}
      colors={["#FFD700", "#FFC0CB", "#87CEFA", "#98FB98", "#DDA0DD"]}
      confettiSource={{
        x: windowSize.width / 2,
        y: windowSize.height / 2,
        w: 0,
        h: 0,
      }}
    />
  );
};