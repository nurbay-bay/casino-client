export interface User {
  id: string;
  username: string;
  phone: string;
  balance: number;
  birthDate: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  username: string;
  birthDate: string;
  phone: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface GameHistory {
  id: string;
  game: "slots" | "plinko";
  bet: number;
  result: "win" | "lose" | "partial";
  amountWon: number;
  details: any;
  createdAt: string;
}


export interface Payment {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'canceled';
  createdAt: string;
}

export interface PlayResponse {
  game: string;
  result: string;
  amountWon: number;
  newBalance: number;
  details: any;
  historyEntry?: GameHistory;
}
