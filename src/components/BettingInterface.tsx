
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus } from 'lucide-react';

interface BettingInterfaceProps {
  onPlaceBet: (color: 'red' | 'green', amount: number) => void;
  disabled: boolean;
  balance: number;
  minBet: number;
}

const BettingInterface: React.FC<BettingInterfaceProps> = ({
  onPlaceBet,
  disabled,
  balance,
  minBet
}) => {
  const [betAmount, setBetAmount] = useState(minBet);
  const [selectedColor, setSelectedColor] = useState<'red' | 'green' | null>(null);

  const quickAmounts = [10, 50, 100, 500, 1000];

  const handleAmountChange = (amount: number) => {
    const newAmount = Math.max(minBet, Math.min(balance, amount));
    setBetAmount(newAmount);
  };

  const handlePlaceBet = (color: 'red' | 'green') => {
    if (betAmount <= balance && betAmount >= minBet) {
      onPlaceBet(color, betAmount);
      setSelectedColor(color);
      setTimeout(() => setSelectedColor(null), 600);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Place Your Bet</h3>
        <p className="text-sm text-muted-foreground">Choose color and amount</p>
      </div>

      {/* Bet Amount Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Bet Amount</span>
          <Badge variant="outline" className="text-xs">
            Min: ₹{minBet}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAmountChange(betAmount - 10)}
            disabled={betAmount <= minBet}
            className="h-10 w-10 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => handleAmountChange(Number(e.target.value))}
            className="text-center font-semibold"
            min={minBet}
            max={balance}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAmountChange(betAmount + 10)}
            disabled={betAmount >= balance}
            className="h-10 w-10 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-5 gap-2">
          {quickAmounts.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => handleAmountChange(amount)}
              disabled={amount > balance}
              className="text-xs"
            >
              ₹{amount}
            </Button>
          ))}
        </div>
      </div>

      {/* Color Selection Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => handlePlaceBet('red')}
          disabled={disabled || betAmount > balance}
          className={`h-16 text-white font-bold text-lg game-button-red hover:scale-105 transition-transform ${
            selectedColor === 'red' ? 'bet-success' : ''
          }`}
        >
          🔴 RED
          <div className="text-xs opacity-80 ml-2">2x</div>
        </Button>
        
        <Button
          onClick={() => handlePlaceBet('green')}
          disabled={disabled || betAmount > balance}
          className={`h-16 text-white font-bold text-lg game-button-green hover:scale-105 transition-transform ${
            selectedColor === 'green' ? 'bet-success' : ''
          }`}
        >
          🟢 GREEN
          <div className="text-xs opacity-80 ml-2">2x</div>
        </Button>
      </div>

      {/* Balance Warning */}
      {betAmount > balance && (
        <div className="text-center text-sm text-destructive">
          Insufficient balance. Please add funds to continue.
        </div>
      )}
    </div>
  );
};

export default BettingInterface;
