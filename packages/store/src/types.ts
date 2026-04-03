export type UserTier = 'FREE' | 'PREMIUM';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  tier: UserTier;
  memberSince: string; // ISO Date
}

export interface PaymentMethod {
  last4: string;
  brand: string;
  expiry: string; // 'MM/YY'
}

export interface Transaction {
  id: string;
  date: string; // ISO Date
  amount: number;
  currency: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
}

export interface UserState {
  profile: UserProfile | null;
  billing: {
    method?: PaymentMethod;
    history: Transaction[];
  };
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // Actions
  setProfile: (profile: UserProfile | null) => void;
  updateUser: (data: Partial<UserProfile>) => void;
  clearUser: () => void;
  setHasHydrated: (value: boolean) => void;
}
