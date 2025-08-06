
// import React from 'react';
// import { Clock, Wallet, User } from 'lucide-react';
// import { Button } from '@/components/ui/button';

// interface GameHeaderProps {
//   balance: number;
//   onProfileClick: () => void;
// }

// const GameHeader: React.FC<GameHeaderProps> = ({ balance, onProfileClick }) => {
//   return (
//     <header className="bg-card border-b border-border p-4 sticky top-0 z-50 backdrop-blur-sm bg-card/95">
//       <div className="container mx-auto flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           <div className="bg-gradient-to-r from-primary to-game-purple p-2 rounded-lg">
//             <Clock className="h-6 w-6 text-white" />
//           </div>
//           <div>
//             <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-game-purple bg-clip-text text-transparent">
//               Color Prediction
//             </h1>
//             <p className="text-sm text-muted-foreground">Real-time Gaming</p>
//           </div>
//         </div>

//         <div className="flex items-center space-x-4">
//           <div className="bg-secondary rounded-lg px-4 py-2 border border-border">
//             <div className="flex items-center space-x-2">
//               <Wallet className="h-4 w-4 text-game-gold" />
//               <div className="text-right">
//                 <p className="text-xs text-muted-foreground">Balance</p>
//                 <p className="font-bold text-game-gold">₹{balance.toFixed(2)}</p>
//               </div>
//             </div>
//           </div>

//           <Button 
//             variant="outline" 
//             size="sm" 
//             onClick={onProfileClick}
//             className="border-border hover:bg-primary/10"
//           >
//             <User className="h-4 w-4 mr-2" />
//             Profile
//           </Button>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default GameHeader;
