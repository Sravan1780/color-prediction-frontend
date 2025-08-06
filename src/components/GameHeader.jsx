import React from 'react';
import { Clock, Wallet, User, LogIn, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const GameHeader = ({ balance = 0, onProfileClick, refreshBalance }) => {
  const navigate = useNavigate();

  // Debug: Log the balance value
  console.log("GameHeader balance:", balance, typeof balance);

  // Safely parse user from localStorage
  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    user = userStr ? JSON.parse(userStr) : null;
    console.log("User from localStorage:", user);
  } catch (error) {
    console.error("Invalid user data in localStorage:", error);
  }

  const handleAuthClick = () => {
    if (user) {
      navigate('/profile', { state: { user } });
    } else {
      navigate('/auth');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Also remove token
    window.location.reload();
  };

  // Ensure balance is a valid number and handle all edge cases
  const displayBalance = (() => {
    if (typeof balance === 'number' && !isNaN(balance)) {
      return balance;
    }
    if (typeof balance === 'string') {
      const parsed = parseFloat(balance);
      return !isNaN(parsed) ? parsed : 0;
    }
    return 0;
  })();

  return (
    <header className="bg-card border-b border-border p-4 sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-primary to-game-purple p-2 rounded-lg">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-game-purple bg-clip-text text-transparent">
              Color Prediction
            </h1>
            <p className="text-sm text-muted-foreground">Real-time Gaming</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <div className="bg-secondary rounded-lg px-4 py-2 border border-border">
              <div className="flex items-center space-x-2">
                <Wallet className="h-4 w-4 text-game-gold" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className="font-bold text-game-gold">
                    ₹{typeof displayBalance === 'number' ? displayBalance.toFixed(2) : '0.00'}
                  </p>
                </div>
                {refreshBalance && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshBalance}
                    className="p-1 h-6 w-6"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {user ? (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAuthClick}
                className="border-border hover:bg-primary/10 text-foreground"
              >
                <User className="h-4 w-4 mr-2" />
                {user.username || user.email || 'Profile'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-border hover:bg-destructive/10 text-destructive hover:text-destructive"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAuthClick}
              className="border-border hover:bg-primary/10 text-foreground"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default GameHeader;