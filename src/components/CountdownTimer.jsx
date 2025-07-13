
import React, { useState, useEffect } from 'react';
import { CircularProgress } from './CircularProgress';

const CountdownTimer = ({ duration, onComplete, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const progress = ((duration - timeLeft) / duration) * 100;

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onComplete();
          return duration; // Reset timer
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onComplete, duration]);

  const getTimerColor = () => {
    if (timeLeft <= 5) return 'text-destructive';
    if (timeLeft <= 10) return 'text-yellow-500';
    return 'text-primary';
  };

  const getTimerClass = () => {
    if (timeLeft <= 5) return 'countdown-pulse';
    return '';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className={`relative ${getTimerClass()}`}>
        <CircularProgress 
          progress={progress} 
          size={120}
          strokeWidth={6}
          color={timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#3b82f6'}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getTimerColor()}`}>
              {timeLeft}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              seconds
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {timeLeft > 0 ? 'Place your bets now!' : 'Round ending...'}
        </p>
      </div>
    </div>
  );
};

export default CountdownTimer;
