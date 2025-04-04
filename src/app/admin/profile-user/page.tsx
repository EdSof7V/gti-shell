"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  UserCredential, 
  User as FirebaseUser,
  getAdditionalUserInfo
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Interfaz para los datos completos del usuario incluyendo tokens
interface ExtendedUserData {
  // Basic user info
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  
  // Verification and contact info
  emailVerified?: boolean;
  phoneNumber?: string | null;
  
  // Auth provider info
  providerId?: string;
  operationType?: string;
  providerData?: any[];
  
  // Tokens and expiration
  accessToken?: string;
  refreshToken?: string;
  tokenExpiration?: number;
  tokenExpiresAt?: Date;
  
  // Timestamps
  creationTime?: string;
  lastSignInTime?: string;
  
  // Additional profile info from provider
  profileInfo?: any;
  
  // Other metadata
  tenantId?: string | null;
  isAnonymous?: boolean;
  [key: string]: any; // For any additional properties
}

export default function UserProfile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [rawUserData, setRawUserData] = useState<ExtendedUserData | null>(null);
  const [tokenDetails, setTokenDetails] = useState<{
    expiresIn: number;
    expiresAt: Date;
  } | null>(null);

  // Function to calculate token expiration time
  const calculateTokenExpiration = (expiresIn: number): { expiresIn: number; expiresAt: Date } => {
    const expirationTime = new Date();
    expirationTime.setSeconds(expirationTime.getSeconds() + expiresIn);
    
    return {
      expiresIn,
      expiresAt: expirationTime
    };
  };

  // Function for Google sign-in with complete data capture
  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      
      // Request additional scopes for more information
      provider.addScope('profile');
      provider.addScope('email');
      
      // Optional: Add more scopes if needed
      // provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
      // provider.addScope('https://www.googleapis.com/auth/user.addresses.read');
      
      // Set custom parameters
      provider.setCustomParameters({
        // Force account selection even if one account is available
        prompt: 'select_account',
        // Include authorization code in the response
        access_type: 'offline'
      });

      const result: UserCredential = await signInWithPopup(auth, provider);
      const userData: FirebaseUser = result.user;
      
      // Get additional profile information provided by Google
      const additionalUserInfo = getAdditionalUserInfo(result);
      
      // Get ID token with force refresh to ensure we get a fresh token
      const idTokenResult = await userData.getIdTokenResult(true);
      
      // Calculate token expiration
      const tokenExp = calculateTokenExpiration(
        (idTokenResult.expirationTime as unknown as number) - Date.now()
      );
      
      setTokenDetails(tokenExp);
      
      // Extract OAuth credential if available
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const oauthToken = credential?.accessToken;
      
      // Save complete user data
      setRawUserData({
        // Basic user info
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        
        // Verification info
        emailVerified: userData.emailVerified,
        phoneNumber: userData.phoneNumber,
        isAnonymous: userData.isAnonymous,
        
        // Provider info
        providerId: result.providerId ?? undefined,
        operationType: result.operationType,
        providerData: userData.providerData,
        
        // Token information
        accessToken: await userData.getIdToken(),
        refreshToken: userData.refreshToken,
        idToken: idTokenResult.token,
        tokenExpiration: new Date(idTokenResult.expirationTime).getTime(),
        tokenExpiresAt: new Date(idTokenResult.expirationTime),
        oauthAccessToken: oauthToken,
        
        // Claims from the token
        claims: idTokenResult.claims,
        
        // Timestamps
        creationTime: userData.metadata?.creationTime,
        lastSignInTime: userData.metadata?.lastSignInTime,
        
        // Additional profile info from Google
        profileInfo: additionalUserInfo?.profile,
        isNewUser: additionalUserInfo?.isNewUser,
        
        // Other metadata
        tenantId: userData.tenantId,
      });
      
      
    } catch (err: any) {
      console.error("Error during sign-in:", err);
      setError(err.message || "Unknown error during sign-in");
    }
  };

  // If user is already authenticated via context
  useEffect(() => {
    const fetchTokenData = async () => {
      if (user) {
        try {
          // Get the Firebase user object from auth
          const currentUser = auth.currentUser;
          
          if (currentUser) {
            // Get a fresh ID token and its details
            const idTokenResult = await currentUser.getIdTokenResult(true);
            
            // Calculate expiration
            const tokenExp = calculateTokenExpiration(
              (new Date(idTokenResult.expirationTime).getTime() - Date.now()) / 1000
            );
            
            setTokenDetails(tokenExp);
            
            // Update user data with token information
            setRawUserData({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              
              // Token information
              accessToken: await currentUser.getIdToken(),
              refreshToken: currentUser.refreshToken,
              idToken: idTokenResult.token,
              tokenExpiration: new Date(idTokenResult.expirationTime).getTime(),
              tokenExpiresAt: new Date(idTokenResult.expirationTime),
              
              // Claims from the token
              claims: idTokenResult.claims,
              
              // Other available information
              emailVerified: currentUser.emailVerified,
              phoneNumber: currentUser.phoneNumber,
              isAnonymous: currentUser.isAnonymous,
              providerData: currentUser.providerData,
              
              // Timestamps
              creationTime: currentUser.metadata?.creationTime,
              lastSignInTime: currentUser.metadata?.lastSignInTime,
              
              // Other metadata
              tenantId: currentUser.tenantId,
            });
          }
        } catch (err: any) {
          console.error("Error fetching token data:", err);
          setError(err.message || "Error retrieving token information");
        }
      }
    };

    fetchTokenData();
  }, [user]);

  // Function to refresh the token
  const handleRefreshToken = async () => {
    try {
      if (auth.currentUser) {
        // Force token refresh
        await auth.currentUser.getIdToken(true);
        
        // After refreshing, update the displayed data
        const idTokenResult = await auth.currentUser.getIdTokenResult();
        
        // Calculate new expiration
        const tokenExp = calculateTokenExpiration(
          (new Date(idTokenResult.expirationTime).getTime() - Date.now()) / 1000
        );
        
        setTokenDetails(tokenExp);
        
        setRawUserData(prevData => ({
          ...prevData,
          accessToken: idTokenResult.token,
          tokenExpiration: new Date(idTokenResult.expirationTime).getTime(),
          tokenExpiresAt: new Date(idTokenResult.expirationTime),
          claims: idTokenResult.claims,
        } as ExtendedUserData));
        
        console.log("Token refreshed successfully");
      }
    } catch (err: any) {
      console.error("Error refreshing token:", err);
      setError(err.message || "Error refreshing token");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Complete User Profile</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {!user && !rawUserData ? (
        <div className="mb-4">
          <p className="mb-2">You are not signed in</p>
          <button 
            onClick={handleGoogleSignIn}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            Sign in with Google
          </button>
        </div>
      ) : (
        <div>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <div className="flex items-center mb-4">
              {rawUserData?.photoURL && (
                <img 
                  src={rawUserData.photoURL} 
                  alt="Profile photo" 
                  className="w-20 h-20 rounded-full mr-4" 
                />
              )}
              <div>
                <h2 className="text-xl font-bold">{rawUserData?.displayName || 'User'}</h2>
                <p className="text-gray-600">{rawUserData?.email || 'No email'}</p>
              </div>
            </div>
            
            {tokenDetails && (
              <div className="bg-yellow-50 p-4 rounded mb-4 border border-yellow-200">
                <h3 className="text-lg font-semibold mb-2">Token Information:</h3>
                <p><strong>Expires in:</strong> {Math.floor(tokenDetails.expiresIn)} seconds</p>
                <p><strong>Expires at:</strong> {tokenDetails.expiresAt.toLocaleString()}</p>
                <button 
                  onClick={handleRefreshToken}
                  className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Refresh Token
                </button>
              </div>
            )}
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Token Data:</h3>
              <div className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-40">
                <p><strong>ID Token:</strong> {rawUserData?.accessToken?.substring(0, 40)}...</p>
                <p><strong>Refresh Token:</strong> {rawUserData?.refreshToken?.substring(0, 40)}...</p>
                <p><strong>OAuth Access Token:</strong> {rawUserData?.oauthAccessToken?.substring(0, 40) || 'Not available'}</p>
                <p><strong>Expires at:</strong> {rawUserData?.tokenExpiresAt?.toLocaleString()}</p>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Complete user data:</h3>
            <pre className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(rawUserData, null, 2)}
            </pre>
            <pre className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(user?.displayName, null, 2)}
            </pre>
            <button 
              onClick={logout}
              className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}