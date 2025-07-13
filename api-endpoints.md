
# Color Prediction Game API Endpoints

## Base URL
```
http://localhost:8080/api
```

## Authentication Endpoints

### POST /auth/register
Register a new user
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "phoneNumber": "string"
}
```

### POST /auth/login
Login user
```json
{
  "email": "string",
  "password": "string"
}
```

### POST /auth/logout
Logout current user

## User Management Endpoints

### GET /users/{userId}
Get user profile

### PUT /users/{userId}
Update user profile
```json
{
  "username": "string",
  "email": "string",
  "phoneNumber": "string"
}
```

### GET /users/{userId}/balance
Get user balance

### POST /users/{userId}/add-money
Add money to user account
```json
{
  "amount": "decimal"
}
```

### POST /users/{userId}/withdraw
Withdraw money from user account
```json
{
  "amount": "decimal"
}
```

### GET /users/{userId}/stats
Get user statistics

## Game Management Endpoints

### GET /games/current
Get current active game

### GET /games/history
Get game history
Query parameters:
- page: int (default: 0)
- size: int (default: 15)

### GET /games/{gameId}
Get specific game details

### GET /games/{gameId}/stats
Get game statistics

### GET /games/{gameId}/live
Get live game data (current bets, players, etc.)

### GET /games/active-players
Get count of active players

## Betting Endpoints

### POST /bets/place
Place a new bet
```json
{
  "gameId": "string",
  "userId": "long",
  "color": "red|green",
  "amount": "decimal"
}
```

### GET /bets/user/{userId}
Get user's betting history
Query parameters:
- page: int (default: 0)
- size: int (default: 10)

### GET /bets/game/{gameId}
Get all bets for a specific game

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## Data Transfer Objects (DTOs)

### UserDTO
```json
{
  "id": "long",
  "username": "string",
  "email": "string",
  "phoneNumber": "string",
  "balance": "decimal",
  "isActive": "boolean",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### GameDTO
```json
{
  "id": "long",
  "gameId": "string",
  "startTime": "timestamp",
  "endTime": "timestamp",
  "winningColor": "red|green",
  "redTotal": "decimal",
  "greenTotal": "decimal",
  "totalBetsCount": "int",
  "status": "active|completed|cancelled",
  "createdAt": "timestamp"
}
```

### BetDTO
```json
{
  "id": "long",
  "userId": "long",
  "gameId": "long",
  "color": "red|green",
  "amount": "decimal",
  "potentialWin": "decimal",
  "actualWin": "decimal",
  "isWinner": "boolean",
  "status": "pending|won|lost",
  "createdAt": "timestamp"
}
```

### TransactionDTO
```json
{
  "id": "long",
  "userId": "long",
  "transactionType": "deposit|withdrawal|bet_deduct|win_credit|bonus",
  "amount": "decimal",
  "balanceBefore": "decimal",
  "balanceAfter": "decimal",
  "referenceId": "string",
  "gameId": "long",
  "status": "pending|completed|failed",
  "description": "string",
  "createdAt": "timestamp"
}
```

### UserStatsDTO
```json
{
  "id": "long",
  "userId": "long",
  "totalGamesPlayed": "int",
  "totalGamesWon": "int",
  "totalAmountBet": "decimal",
  "totalAmountWon": "decimal",
  "biggestWin": "decimal",
  "winRate": "decimal",
  "currentStreak": "int",
  "longestWinStreak": "int",
  "longestLoseStreak": "int",
  "lastGamePlayed": "timestamp"
}
```

## WebSocket Endpoints (Optional)

### /ws/game-updates
Subscribe to real-time game updates

### /ws/live-stats
Subscribe to live statistics updates

## Error Codes

- `USER_NOT_FOUND`: User not found
- `INSUFFICIENT_BALANCE`: Insufficient account balance
- `INVALID_BET_AMOUNT`: Bet amount is invalid
- `GAME_NOT_ACTIVE`: Game is not active for betting
- `BET_ALREADY_PLACED`: User has already placed a bet for this game
- `INVALID_CREDENTIALS`: Invalid login credentials
- `EMAIL_ALREADY_EXISTS`: Email already registered
- `USERNAME_ALREADY_EXISTS`: Username already taken
- `WITHDRAWAL_LIMIT_EXCEEDED`: Daily withdrawal limit exceeded
- `MAINTENANCE_MODE`: System is under maintenance
