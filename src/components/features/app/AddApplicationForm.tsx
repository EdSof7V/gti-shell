"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createApplication } from "@/lib/services/applicationService";

interface ApplicationCreate {
  name: string;
  application_key: string;
  description: string;
  version: string;
}

const commonVersions = [
  { value: "1.0.0", label: "1.0.0" },
  { value: "1.0.1", label: "1.0.1" },
  { value: "1.1.0", label: "1.1.0" },
  { value: "2.0.0", label: "2.0.0" },
];

export default function AddApplicationForm() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ApplicationCreate>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  const onSubmit: SubmitHandler<ApplicationCreate> = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await createApplication(data);
      console.log("Aplicación creada:", result);
      setSuccess(true);
      
      reset();
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      console.error("Error al crear la aplicación:", err);
      setError(err.response?.data?.message || err.message || "Error al crear la aplicación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Crear Aplicación</h2>
        
        {success && (
          <Link 
            href="/applications/"
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
            Regresar a Aplicaciones
          </Link>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          ¡Aplicación creada exitosamente!
          <div className="mt-2">
            <button 
              onClick={() => router.push('/applications/')} 
              className="flex items-center text-green-700 hover:text-green-900 font-medium"
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
              Ver todas las aplicaciones
            </button>
          </div>
        </div>
      )}
      
      <form className="mx-auto" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Nombre de la Aplicación
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            id="name"
            type="text" 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            placeholder="Ingrese el nombre de la aplicación"
            {...register("name", { required: "El nombre de la aplicación es obligatorio" })}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
        
        <div className="mb-5">
          <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Descripción
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea 
            id="description"
            rows={3}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            placeholder="Ingrese una descripción para la aplicación"
            {...register("description", { required: "La descripción es obligatoria" })}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>
        
        <div className="mb-5">
          <label htmlFor="application_key" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Clave de Aplicación
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            id="application_key"
            type="text" 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            placeholder="GTI"
            {...register("application_key", { 
              required: "La clave de la aplicación es obligatoria",
              pattern: {
                value: /^[a-zA-Z0-9-_]+$/,
                message: "La clave solo puede contener letras, números, guiones y guiones bajos"
              }
            })}
          />
          {errors.application_key && (
            <p className="text-red-500 text-sm mt-1">{errors.application_key.message}</p>
          )}
        </div>
        
        <div className="mb-5">
          <label htmlFor="version" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Versión
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="version"
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="1.0.0"
            list="version-options"
            {...register("version", { 
              required: "La versión es obligatoria",
              pattern: {
                value: /^\d+\.\d+\.\d+$/,
                message: "Utilice el formato semántico de versiones (ej. 1.0.0)"
              }
            })}
          />
          <datalist id="version-options">
            {commonVersions.map((version) => (
              <option key={version.value} value={version.value} />
            ))}
          </datalist>
          {errors.version && (
            <p className="text-red-500 text-sm mt-1">{errors.version.message}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <button 
            type="submit" 
            disabled={loading}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Creando..." : "Crear Aplicación"}
          </button>
          
          <Link 
            href="/apps/"
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