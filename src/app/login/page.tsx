"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function GTIAccessCard() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="max-w-sm w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white text-center">
          Acceso al GTI
        </h5>
        <p className="mb-4 font-normal text-gray-700 dark:text-gray-400">
          Se requiere autenticación mediante Google por única vez para acceder al sistema de Gobierno de Tecnología de Información (GTI).
        </p>
        
        <button 
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 px-5 flex justify-center items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-semibold border border-gray-300 rounded-lg shadow transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600"
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
          </svg>
          Iniciar sesión con Google
        </button>
        
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Esta autenticación es necesaria para verificar tu identidad y garantizar la seguridad del acceso a la plataforma de GTI.
        </p>
      </div>
    </div>
  );
}