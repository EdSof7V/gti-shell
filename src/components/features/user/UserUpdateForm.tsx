"use client";

import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserById, User } from "@/lib/services/userService";
import { updateUser } from "@/lib/services/authService";

interface UpdateUserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

interface UserUpdateFormProps {
  userId: string;
}

export default function UserUpdateForm({ userId }: UserUpdateFormProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UpdateUserFormData>();
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [userData, setUserData] = useState<User | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const user = await getUserById(userId);
        
        if (!user) {
          setError("Usuario no encontrado");
          return;
        }
        
        setUserData(user);
        
        // Populate form with user data
        setValue("username", user.username);
        setValue("email", user.email);
        setValue("first_name", user.first_name);
        setValue("last_name", user.last_name);
        setValue("is_active", user.is_active);
        
      } catch (err: any) {
        console.error("Error al cargar datos del usuario:", err);
        setError(err.response?.data?.message || "Error al cargar los datos del usuario");
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUser();
    }
  }, [userId, setValue]);

  const onSubmit: SubmitHandler<UpdateUserFormData> = async (data) => {
    setSubmitting(true);
    setError(null);
    
    try {
      const result = await updateUser(userId, {
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        is_active: data.is_active
      });
      
      console.log("Usuario actualizado:", result);
      setSuccess(true);
      
      // Update local user data
      setUserData(result);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      console.error("Error al actualizar el usuario:", err);
      setError(err.response?.data?.message || "Error al actualizar el usuario");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <div className="mt-4">
          <Link 
            href="/users"
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Regresar a la lista de usuarios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Actualizar Usuario</h2>
        
        <Link 
          href="/users"
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M11 17l-5-5m0 0l5-5m-5 5h12" 
            />
          </svg>
          Regresar a Usuarios
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          ¡Usuario actualizado exitosamente!
        </div>
      )}
      
      <form className="mx-auto" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Nombre de usuario
          </label>
          <input 
            id="username"
            type="text" 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            {...register("username", { 
              required: "El nombre de usuario es obligatorio",
              pattern: {
                value: /^[a-zA-Z0-9._-]+$/,
                message: "El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos"
              }
            })}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
          )}
        </div>
        
        <div className="mb-5">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Correo electrónico
          </label>
          <input 
            id="email"
            type="email" 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            {...register("email", { 
              required: "El correo electrónico es obligatorio",
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                message: "Ingrese un correo electrónico válido"
              }
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Nombres
            </label>
            <input 
              id="first_name"
              type="text" 
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
              {...register("first_name", { 
                required: "El nombre es obligatorio" 
              })}
            />
            {errors.first_name && (
              <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="last_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Apellidos
            </label>
            <input 
              id="last_name"
              type="text" 
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
              {...register("last_name", { 
                required: "El apellido es obligatorio" 
              })}
            />
            {errors.last_name && (
              <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
            )}
          </div>
        </div>
        
        <div className="mb-5">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              {...register("is_active")}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Usuario activo</span>
          </label>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <button 
            type="submit" 
            disabled={submitting}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? "Actualizando..." : "Actualizar Usuario"}
          </button>
          
          <Link 
            href="/users"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 ml-4 flex items-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
            Cancelar
          </Link>
        </div>
      </form>
      
      {userData && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-md font-medium mb-3 text-gray-900 dark:text-white">Información adicional</h3>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col space-y-1">
                <span className="text-gray-500 dark:text-gray-400">Fecha de creación:</span>
                <span className="text-gray-900 dark:text-white">{new Date(userData.created_at).toLocaleString()}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-gray-500 dark:text-gray-400">Último acceso:</span>
                <span className="text-gray-900 dark:text-white">
                  {userData.last_login_date 
                    ? new Date(userData.last_login_date).toLocaleString() 
                    : "No ha accedido aún"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}