
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

const GameHistory = ({ results }) => {
  const getColorClass = (color) => {
    return color === 'red' 
      ? 'bg-red-500/20 text-red-400 border-red-500/30' 
      : 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  const getLastThreeDigits = (id) => {
    return id.toString().slice(-3);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Game History</h3>
        <Badge variant="outline" className="text-xs">
          Last {results.length} rounds
        </Badge>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No games played yet</p>
            <p className="text-xs">History will appear here</p>
          </div>
        ) : (
          results.map((result) => (
            <div
              key={result.id}
              className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border hover:bg-secondary/80 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Badge 
                  variant="outline" 
                  className={`text-xs font-mono ${getColorClass(result.winningColor)}`}
                >
                  #{getLastThreeDigits(result.id)}
                </Badge>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    result.winningColor === 'red' ? 'bg-red-500' : 'bg-green-500'
                  }`} />
                  <span className="font-medium text-sm">
                    {result.winningColor.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  R: ₹{result.redTotal} | G: ₹{result.greenTotal}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GameHistory;
