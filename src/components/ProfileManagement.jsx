import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Wallet, TrendingUp, Edit, Save, X, Plus, Minus } from 'lucide-react';
import { apiService } from '@/services/api';

const ProfileManagement = ({ onClose }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [userProfile, setUserProfile] = useState({});
  const [userStats, setUserStats] = useState({});
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState('');
  
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
      fetchUserBalance();
      fetchUserStats();
    }
  }, [user?.id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserProfile(user.id);
      setUserProfile(response.data);
      setProfileForm({
        username: response.data.username || '',
        email: response.data.email || '',
        phoneNumber: response.data.phoneNumber || ''
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      if (error.response?.status === 404) {
        toast({
          title: "User Not Found",
          description: "The requested user profile could not be found",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserBalance = async () => {
    try {
      const response = await apiService.getUserBalance(user.id);
      setBalance(response.data.balance || 0);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await apiService.getUserStats(user.id);
      setUserStats(response.data || {});
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      await apiService.updateUserProfile(user.id, profileForm);
      setUserProfile({ ...userProfile, ...profileForm });
      setEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await apiService.addMoney(user.id, parseFloat(amount));
      await fetchUserBalance();
      setAmount('');
      toast({
        title: "Success",
        description: `₹${amount} added to your account`,
      });
    } catch (error) {
      console.error('Failed to add money:', error);
      toast({
        title: "Error",
        description: "Failed to add money",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > balance) {
      toast({
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await apiService.withdrawMoney(user.id, parseFloat(amount));
      await fetchUserBalance();
      setAmount('');
      toast({
        title: "Success",
        description: `₹${amount} withdrawn from your account`,
      });
    } catch (error) {
      console.error('Failed to withdraw money:', error);
      toast({
        title: "Error",
        description: "Failed to withdraw money",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-primary to-game-purple p-2 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-game-purple bg-clip-text text-transparent">
                Profile Management
              </h1>
              <p className="text-muted-foreground">Manage your account settings and wallet</p>
            </div>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose} size="sm">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          )}
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Wallet className="h-4 w-4 mr-2" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Personal Information</span>
                    </CardTitle>
                    <CardDescription>
                      Update your profile information
                    </CardDescription>
                  </div>
                  {!editing ? (
                    <Button variant="outline" onClick={() => setEditing(true)} size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={handleProfileUpdate} disabled={loading} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditing(false)} size="sm">
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      disabled={!editing}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      disabled={!editing}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                      disabled={!editing}
                      className="bg-secondary/50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wallet className="h-5 w-5 text-game-gold" />
                    <span>Current Balance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-game-gold">
                    ₹{balance.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Available for betting
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Wallet Actions</CardTitle>
                  <CardDescription>
                    Add or withdraw money from your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleAddMoney} 
                      disabled={loading || !amount}
                      className="game-button-green flex-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Money
                    </Button>
                    <Button 
                      onClick={handleWithdrawMoney} 
                      disabled={loading || !amount}
                      variant="outline"
                      className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
                    >
                      <Minus className="h-4 w-4 mr-2" />
                      Withdraw
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Games</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.totalGamesPlayed || 0}</div>
                  <p className="text-xs text-muted-foreground">Games played</p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-game-green">
                    {userStats.winRate ? `${(userStats.winRate * 100).toFixed(1)}%` : '0%'}
                  </div>
                  <p className="text-xs text-muted-foreground">Success rate</p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Won</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-game-gold">
                    ₹{userStats.totalAmountWon ? userStats.totalAmountWon.toFixed(2) : '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">Total winnings</p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Bet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{userStats.totalAmountBet ? userStats.totalAmountBet.toFixed(2) : '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">Amount wagered</p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Biggest Win</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-game-purple">
                    ₹{userStats.biggestWin ? userStats.biggestWin.toFixed(2) : '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">Largest payout</p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userStats.currentStreak || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {userStats.currentStreak > 0 ? 'Win streak' : 'No streak'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Games Won</span>
                    <span className="text-sm text-game-green">
                      {userStats.totalGamesWon || 0} / {userStats.totalGamesPlayed || 0}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Longest Win Streak</span>
                    <span className="text-sm text-game-gold">
                      {userStats.longestWinStreak || 0} games
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Last Game Played</span>
                    <span className="text-sm text-muted-foreground">
                      {userStats.lastGamePlayed 
                        ? new Date(userStats.lastGamePlayed).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileManagement;