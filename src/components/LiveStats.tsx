
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

interface LiveStatsProps {
  currentRoundBets: {
    red: number;
    green: number;
  };
  totalPlayers: number;
  roundId: string;
}

const LiveStats: React.FC<LiveStatsProps> = ({ 
  currentRoundBets, 
  totalPlayers, 
  roundId 
}) => {
  const totalBets = currentRoundBets.red + currentRoundBets.green;
  const redPercentage = totalBets > 0 ? (currentRoundBets.red / totalBets) * 100 : 50;
  const greenPercentage = totalBets > 0 ? (currentRoundBets.green / totalBets) * 100 : 50;

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Round</h3>
        <Badge variant="outline" className="font-mono text-xs">
          #{roundId.slice(-3)}
        </Badge>
      </div>

      {/* Current Round Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-red-400 font-medium">🔴 RED</span>
            <span className="text-red-400 font-bold">
              {redPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2">
            <div className="text-sm text-muted-foreground">Total Bets</div>
            <div className="text-lg font-bold text-red-400">
              ₹{currentRoundBets.red.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-green-400 font-medium">🟢 GREEN</span>
            <span className="text-green-400 font-bold">
              {greenPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2">
            <div className="text-sm text-muted-foreground">Total Bets</div>
            <div className="text-lg font-bold text-green-400">
              ₹{currentRoundBets.green.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Betting Ratio Visualization */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-red-400">Red Bets</span>
          <span className="text-green-400">Green Bets</span>
        </div>
        <div className="flex h-3 bg-secondary rounded-full overflow-hidden">
          <div 
            className="bg-red-500 transition-all duration-500"
            style={{ width: `${redPercentage}%` }}
          />
          <div 
            className="bg-green-500 transition-all duration-500"
            style={{ width: `${greenPercentage}%` }}
          />
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">Players</div>
            <div className="font-semibold">{totalPlayers}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-game-gold" />
          <div>
            <div className="text-xs text-muted-foreground">Total Pool</div>
            <div className="font-semibold">₹{totalBets.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStats;
