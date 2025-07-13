import React, { useState, useEffect } from 'react';
import GameHeader from '@/components/GameHeader';
import CountdownTimer from '@/components/CountdownTimer';
import BettingInterface from '@/components/BettingInterface';
import GameHistory from '@/components/GameHistory';
import LiveStats from '@/components/LiveStats';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';

const Index = () => {
  // Game state
  const [balance, setBalance] = useState(1000);
  const [gameHistory, setGameHistory] = useState([]);
  const [currentRoundBets, setCurrentRoundBets] = useState({ red: 0, green: 0 });
  const [userCurrentBet, setUserCurrentBet] = useState(null);
  const [isGameActive, setIsGameActive] = useState(true);
  const [currentRoundId, setCurrentRoundId] = useState('');
  const [currentGame, setCurrentGame] = useState(null);
  
  // Game settings
  const ROUND_DURATION = 30; // seconds
  const MIN_BET = 10;
  const totalPlayers = 127; // Mock data

  // Move these variables outside the function to persist across calls
  let currentDate = '';
  let increment = 0;

  // Fixed: Generate unique round ID with proper state management
  const generateRoundId = () => {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
                    (now.getMonth() + 1).toString().padStart(2, '0') +
                    now.getDate().toString().padStart(2, '0');

    if (currentDate !== dateStr) {
      currentDate = dateStr;
      increment = 0;
    }

    increment++;
    const incrementStr = increment.toString().padStart(3, '0');
    
    // Add timestamp to ensure uniqueness
    const timestamp = now.getTime().toString().slice(-4);
    return `${dateStr}${incrementStr}_${timestamp}`;
  };

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const userId = apiService.getUserId(); // Replace with actual user ID
        const userBalance = await apiService.getUserBalance(userId);
        console.log('Chintu :', userBalance);
        setBalance(userBalance);
      } catch (error) {
        console.error('Failed to load balance:', error);
        setBalance(1000); // Fallback
      }
    };
    
    loadBalance();
  }, []);

  // Alternative: Use timestamp-based ID generation
  const generateUniqueRoundId = () => {
    const now = new Date();
    const timestamp = now.getTime();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `GAME_${timestamp}_${random}`;
  };

  // Initialize first round
  useEffect(() => {
    initializeGame();
    loadGameHistory();
  }, []);

  // Initialize or create a new game
  const initializeGame = async () => {
    try {
      // Try to get current active game first
      let currentGame;
      try {
        currentGame = await apiService.getCurrentGame();
      } catch (error) {
        console.log('No active game found, will create new one');
        currentGame = null;
      }
      
      if (currentGame) {
        setCurrentRoundId(currentGame.gameId);
        setCurrentGame(currentGame);
        setCurrentRoundBets({
          red: parseFloat(currentGame.redTotal || 0),
          green: parseFloat(currentGame.greenTotal || 0)
        });
        console.log('Found active game:', currentGame.gameId);
      } else {
        // Create new game if no active game exists
        await createNewGame();
      }
    } catch (error) {
      console.error('Failed to initialize game:', error);
      // Fallback to local game ID
      const fallbackId = generateUniqueRoundId();
      setCurrentRoundId(fallbackId);
      toast({
        title: "Connection Issue",
        description: "Running in offline mode",
        variant: "destructive",
      });
    }
  };

  // Separate function to create new game
  const createNewGame = async () => {
    try {
      const newGameId = generateUniqueRoundId();
      console.log('Creating new game with ID:', newGameId);
      
      const newGame = await apiService.createGame(newGameId);
      setCurrentRoundId(newGame.gameId);
      setCurrentGame(newGame);
      setCurrentRoundBets({ red: 0, green: 0 });
      console.log('Created new game:', newGame.gameId);
      
      return newGame;
    } catch (error) {
      console.error('Failed to create new game:', error);
      
      // Fallback to local game
      const fallbackId = generateUniqueRoundId();
      setCurrentRoundId(fallbackId);
      setCurrentGame(null);
      
      toast({
        title: "Connection Issue",
        description: "Unable to create new game. Running locally.",
        variant: "destructive",
      });
      
      return { gameId: fallbackId };
    }
  };

  // Load game history from API
  const loadGameHistory = async () => {
    try {
      const history = await apiService.getGameHistory();
      // Convert the API response format to match your component expectations
      const formattedHistory = history.map((game, index) => ({
        // Use a combination of gameId and index to ensure uniqueness
        id: `${game.gameId}_${index}`,
        gameId: game.gameId, // Keep original gameId for reference
        winningColor: game.winningColor?.toLowerCase() || 'red',
        timestamp: new Date(game.endTime || game.createdAt),
        redTotal: parseFloat(game.redTotal || 0),
        greenTotal: parseFloat(game.greenTotal || 0)
      }));
      setGameHistory(formattedHistory);
    } catch (error) {
      console.error('Failed to load game history:', error);
      
      // Provide some mock data for testing if API fails
      const mockHistory = [
        {
          id: 'mock_1',
          gameId: 'GAME_001',
          winningColor: 'red',
          timestamp: new Date(Date.now() - 300000),
          redTotal: 1250.75,
          greenTotal: 890.25
        },
        {
          id: 'mock_2',
          gameId: 'GAME_002',
          winningColor: 'green',
          timestamp: new Date(Date.now() - 600000),
          redTotal: 560.50,
          greenTotal: 1340.80
        }
      ];
      setGameHistory(mockHistory);
    }
  };

  const handlePlaceBet = async (color, amount) => {
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

    try {
      const userId = apiService.getUserId();

      if(!userId) {
        toast({
          title: "Authentication Error",
          description: "Please login to place a bet",
          variant: "destructive",
        });
        Navigate('/');
        return;
      }
      
      const betData = {
          userId: userId,      // Make sure this is a number, not string
          gameId: currentRoundId,
          color: color.toUpperCase(), // Ensure uppercase
          amount: Number(amount)      // Ensure it's a number
      };
      
      console.log('Placing bet:', betData);
      
      await apiService.placeBet(betData);
      
      // Update game totals
      await apiService.updateGameTotals(currentRoundId, color, amount);
      
      // Update local state - Remove balance deduction since backend handles it
      setUserCurrentBet({ color, amount, roundId: currentRoundId });
      setCurrentRoundBets(prev => ({
        ...prev,
        [color]: prev[color] + amount
      }));

      toast({
        title: "Bet Placed Successfully!",
        description: `₹${amount} on ${color.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Failed to place bet:', error);
      
      // Handle authentication errors
      if (error.message.includes('User not found') || error.message.includes('login again')) {
        toast({
          title: "Authentication Error",
          description: "Please login again to continue",
          variant: "destructive",
        });
        // Optionally redirect to login page
        // window.location.href = '/login';
        return;
      }
      
      toast({
        title: "Bet Failed",
        description: error.message || "Unable to place bet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProfileClick = () => {
    toast({
      title: "Profile Feature",
      description: "Profile management coming soon!",
    });
  };

  const handleRoundComplete = async () => {
    console.log('Round completed, completing game on server...');
    
    try {
      // Complete the current game on server (server will generate random winning color and process bets)
      const completedGame = await apiService.completeGame(currentRoundId);
      
      console.log('Game completed:', completedGame);

      // Format for history with unique ID
      const gameResult = {
        id: `${completedGame.gameId}_${Date.now()}`,
        gameId: completedGame.gameId,
        winningColor: completedGame.winningColor.toLowerCase(),
        timestamp: new Date(completedGame.endTime),
        redTotal: parseFloat(completedGame.redTotal || 0),
        greenTotal: parseFloat(completedGame.greenTotal || 0)
      };

      // Add to history
      setGameHistory(prev => [gameResult, ...prev].slice(0, 15));

      // Refresh user balance from server (since backend handled win/loss)
      await refreshBalance();

      // Show result to user
      if (userCurrentBet) {
        if (userCurrentBet.color === gameResult.winningColor) {
          const winAmount = userCurrentBet.amount * 2;
          toast({
            title: "🎉 Congratulations!",
            description: `You won ₹${winAmount}! ${gameResult.winningColor.toUpperCase()} was the winning color.`,
          });
        } else {
          toast({
            title: "Better luck next time!",
            description: `${gameResult.winningColor.toUpperCase()} won this round.`,
            variant: "destructive",
          });
        }
      }

      // Start new round after 3 seconds
      setTimeout(async () => {
        await createNewGame();
        setUserCurrentBet(null);
        
        toast({
          title: "New Round Started!",
          description: "Place your bets now!",
        });
      }, 3000);

    } catch (error) {
      console.error('Failed to complete game:', error);
      
      // Fallback to local completion (same as before)
      const winningColor = Math.random() > 0.5 ? 'red' : 'green';
      const gameResult = {
        id: `${currentRoundId}_${Date.now()}`,
        gameId: currentRoundId,
        winningColor,
        timestamp: new Date(),
        redTotal: currentRoundBets.red,
        greenTotal: currentRoundBets.green
      };
      
      setGameHistory(prev => [gameResult, ...prev].slice(0, 15));
      
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
      
      setTimeout(() => {
        setCurrentRoundBets({ red: 0, green: 0 });
        setUserCurrentBet(null);
        setCurrentRoundId(generateUniqueRoundId());
      }, 3000);
    }
  };

  const refreshBalance = async () => {
    try {
      const userId = apiService.getUserId(); // Replace with actual user ID
      const newBalance = await apiService.getUserBalance(userId);
      setBalance(newBalance);
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <GameHeader 
        balance={balance} 
        onProfileClick={handleProfileClick}
        onRefreshBalance={refreshBalance}
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
