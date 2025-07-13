
import React, { useState, useEffect } from 'react';
import GameHeader from '@/components/GameHeader';
import CountdownTimer from '@/components/CountdownTimer';
import BettingInterface from '@/components/BettingInterface';
import GameHistory from '@/components/GameHistory';
import LiveStats from '@/components/LiveStats';
import { toast } from '@/hooks/use-toast';

interface GameResult {
  id: string;
  winningColor: 'red' | 'green';
  timestamp: Date;
  redTotal: number;
  greenTotal: number;
}

interface UserBet {
  color: 'red' | 'green';
  amount: number;
  roundId: string;
}

const Index = () => {
  // Game state
  const [balance, setBalance] = useState(1000);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [currentRoundBets, setCurrentRoundBets] = useState({ red: 0, green: 0 });
  const [userCurrentBet, setUserCurrentBet] = useState<UserBet | null>(null);
  const [isGameActive, setIsGameActive] = useState(true);
  const [currentRoundId, setCurrentRoundId] = useState('');
  
  // Game settings
  const ROUND_DURATION = 30; // seconds
  const MIN_BET = 10;
  const totalPlayers = 127; // Mock data

  // Generate unique round ID
  const generateRoundId = () => {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
                   (now.getMonth() + 1).toString().padStart(2, '0') +
                   now.getDate().toString().padStart(2, '0') +
                   now.getHours().toString().padStart(2, '0') +
                   now.getMinutes().toString().padStart(2, '0') +
                   now.getSeconds().toString().padStart(2, '0');
    const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return dateStr + randomDigits;
  };

  // Initialize first round
  useEffect(() => {
    setCurrentRoundId(generateRoundId());
  }, []);

  // Handle bet placement
  const handlePlaceBet = (color: 'red' | 'green', amount: number) => {
    if (amount > balance) {
      toast({
        title: "Insufficient Balance",
        description: "Please add funds to your account",
        variant: "destructive",
      });
      return;
    }

    if (userCurrentBet) {
      toast({
        title: "Bet Already Placed",
        description: "You can only place one bet per round",
        variant: "destructive",
      });
      return;
    }

    // Place the bet
    setBalance(prev => prev - amount);
    setUserCurrentBet({ color, amount, roundId: currentRoundId });
    setCurrentRoundBets(prev => ({
      ...prev,
      [color]: prev[color] + amount
    }));

    toast({
      title: "Bet Placed Successfully!",
      description: `₹${amount} on ${color.toUpperCase()}`,
    });

    console.log(`Bet placed: ₹${amount} on ${color} for round ${currentRoundId}`);
  };

  // Handle round completion
  const handleRoundComplete = () => {
    console.log('Round completed, generating result...');
    
    // Generate random result (in real app, this would come from server)
    const winningColor: 'red' | 'green' = Math.random() > 0.5 ? 'red' : 'green';
    
    // Create game result
    const gameResult: GameResult = {
      id: currentRoundId,
      winningColor,
      timestamp: new Date(),
      redTotal: currentRoundBets.red,
      greenTotal: currentRoundBets.green
    };

    // Add to history
    setGameHistory(prev => [gameResult, ...prev].slice(0, 15));

    // Check if user won
    if (userCurrentBet) {
      if (userCurrentBet.color === winningColor) {
        const winAmount = userCurrentBet.amount * 2;
        setBalance(prev => prev + winAmount);
        toast({
          title: "🎉 Congratulations!",
          description: `You won ₹${winAmount}! ${winningColor.toUpperCase()} was the winning color.`,
        });
      } else {
        toast({
          title: "Better luck next time!",
          description: `${winningColor.toUpperCase()} won this round.`,
          variant: "destructive",
        });
      }
    }

    // Reset for next round
    setTimeout(() => {
      setCurrentRoundBets({ red: 0, green: 0 });
      setUserCurrentBet(null);
      setCurrentRoundId(generateRoundId());
      
      toast({
        title: "New Round Started!",
        description: "Place your bets now!",
      });
    }, 3000);
  };

  const handleProfileClick = () => {
    toast({
      title: "Profile Feature",
      description: "Profile management coming soon!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <GameHeader 
        balance={balance} 
        onProfileClick={handleProfileClick}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Game Timer and Stats Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Countdown Timer */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <CountdownTimer
                duration={ROUND_DURATION}
                onComplete={handleRoundComplete}
                isActive={isGameActive}
              />
            </div>
          </div>

          {/* Live Stats */}
          <div className="lg:col-span-2">
            <LiveStats
              currentRoundBets={currentRoundBets}
              totalPlayers={totalPlayers}
              roundId={currentRoundId}
            />
          </div>
        </div>

        {/* Betting Interface and History Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Betting Interface */}
          <div>
            <BettingInterface
              onPlaceBet={handlePlaceBet}
              disabled={!!userCurrentBet}
              balance={balance}
              minBet={MIN_BET}
            />
            
            {userCurrentBet && (
              <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Your bet this round:</p>
                  <p className="font-bold text-primary">
                    ₹{userCurrentBet.amount} on {userCurrentBet.color.toUpperCase()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Game History */}
          <div>
            <GameHistory results={gameHistory} />
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">How to Play</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <div className="font-semibold text-foreground mb-1">1. Choose Color</div>
              <p>Select RED or GREEN</p>
            </div>
            <div>
              <div className="font-semibold text-foreground mb-1">2. Place Bet</div>
              <p>Enter amount and confirm</p>
            </div>
            <div>
              <div className="font-semibold text-foreground mb-1">3. Win 2x</div>
              <p>Correct prediction pays 2:1</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
