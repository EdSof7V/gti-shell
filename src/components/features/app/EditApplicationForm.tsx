"use client";
import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getApplicationById, updateApplication, ApplicationCreate } from "@/lib/services/applicationService";

interface EditApplicationFormProps {
  applicationId: string;
}

// Lista de versiones comunes para facilitar la entrada
const commonVersions = [
  { value: "1.0.0", label: "1.0.0" },
  { value: "1.0.1", label: "1.0.1" },
  { value: "1.1.0", label: "1.1.0" },
  { value: "2.0.0", label: "2.0.0" },
];

export default function EditApplicationForm({ applicationId }: EditApplicationFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ApplicationCreate>();
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        setInitialLoading(true);
        setError(null);
        
        const application = await getApplicationById(applicationId);
        
        if (application) {
          // Establecer valores por defecto en el formulario
          reset({
            name: application.name,
            application_key: application.application_key,
            description: application.description,
            version: application.version,
            url: application.url || '' 
          });
        } else {
          setError("No se encontró la aplicación especificada");
        }
      } catch (err: any) {
        console.error("Error al cargar datos de la aplicación:", err);
        setError(err.response?.data?.message || "Error al cargar datos de la aplicación");
      } finally {
        setInitialLoading(false);
      }
    };

    if (applicationId) {
      fetchApplicationData();
    }
  }, [applicationId, reset]);

  const onSubmit: SubmitHandler<ApplicationCreate> = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await updateApplication(applicationId, data);
      console.log("Aplicación actualizada:", result);
      setSuccess(true);
      
      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      console.error("Error al actualizar la aplicación:", err);
      setError(err.response?.data?.message || err.message || "Error al actualizar la aplicación");
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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Editar Aplicación</h2>
        
        <Link 
          href="/admin/apps/"
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
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          ¡Aplicación actualizada exitosamente!
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
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
          
          <Link 
            href="/admin/apps/"
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