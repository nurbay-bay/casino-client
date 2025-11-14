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
  _id: string;
  userId: string;
  game: "slots" | "plinko";
  bet: number;
  multiplier?: number;
  result: "win" | "lose";
  amountWon: number;
  details: {
    symbols?: string[];
    multiplier?: number;
    cell?: number;
    path?: number[];
    multipliers?: number[];
  };
  createdAt: string;
}


export interface Payment {
  _id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'canceled';
  invoiceId?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface CreatePaymentResponse {
  id: string;
  paymentUrl: string;
  invoiceId: string;
  status: string;
}

export interface PlayResponse {
  game: "slots" | "plinko";
  result: "win" | "lose";
  amountWon: number;
  newBalance: number;
  details: {
    symbols?: string[];
    multiplier?: number;
    cell?: number;
    path?: number[];
    multipliers?: number[];
  };
  historyEntry?: GameHistory;
}
