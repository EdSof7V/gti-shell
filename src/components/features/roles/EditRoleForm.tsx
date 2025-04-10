"use client";
import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getRoleById, updateRole, RoleCreate } from "@/lib/services/roleService";

interface EditRoleFormProps {
  roleId: string;
}

export default function EditRoleForm({ roleId }: EditRoleFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoleCreate>();
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchRoleData = async () => {
      try {
        setInitialLoading(true);
        setError(null);
        
        const role = await getRoleById(roleId);
        
        if (role) {
          // Establecer valores por defecto en el formulario
          reset({
            name: role.name,
            description: role.description,
            role_code: role.role_code || "" // Incluimos el código del rol
          });
        } else {
          setError("No se encontró el rol especificado");
        }
      } catch (err: any) {
        console.error("Error al cargar datos del rol:", err);
        setError(err.response?.data?.message || "Error al cargar datos del rol");
      } finally {
        setInitialLoading(false);
      }
    };

    if (roleId) {
      fetchRoleData();
    }
  }, [roleId, reset]);

  const onSubmit: SubmitHandler<RoleCreate> = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await updateRole(roleId, data);
      console.log("Rol actualizado:", result);
      setSuccess(true);
      
      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      console.error("Error al actualizar el rol:", err);
      setError(err.response?.data?.message || err.message || "Error al actualizar el rol");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 flex justify-center items-center min-h-[16rem]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Editar Rol</h2>
        
        <Link 
          href="/admin/roles/"
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
          Regresar a Roles
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          ¡Rol actualizado exitosamente!
        </div>
      )}
      
      <form className="mx-auto" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Nombre del Rol
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            id="name"
            type="text" 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            placeholder="Ingrese el nombre del rol"
            {...register("name", { required: "El nombre del rol es obligatorio" })}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
        
        <div className="mb-5">
          <label htmlFor="role_code" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Código del Rol
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            id="role_code"
            type="text" 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            placeholder="Ingrese el código del rol (ej: ADM, USR)"
            maxLength={5}
            {...register("role_code", { 
              required: "El código del rol es obligatorio",
              pattern: {
                value: /^[A-Z0-9]{2,5}$/,
                message: "El código debe consistir de 2-5 caracteres en mayúsculas y/o números"
              }
            })}
          />
          {errors.role_code && (
            <p className="text-red-500 text-sm mt-1">{errors.role_code.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Utilice un código corto (2-5 caracteres) en mayúsculas para identificar el rol.
          </p>
        </div>
        
        <div className="mb-5">
          <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Descripción
          </label>
          <textarea 
            id="description"
            rows={3}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            placeholder="Ingrese una descripción para el rol"
            {...register("description")}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button 
            type="submit" 
            disabled={loading}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
          
          <Link 
            href="/admin/roles/"
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
    </div>
  );
}