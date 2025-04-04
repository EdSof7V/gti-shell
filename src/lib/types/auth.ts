export interface UserType {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }
  
  export interface AuthContextType {
    user: UserType | null;
    loading: boolean;
    signInWithGoogle: () => Promise<any>;
    logout: () => Promise<void>;
  }