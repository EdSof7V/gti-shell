"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserById, User } from "@/lib/services/userService";
import { getUserApplications, UserApplication } from "@/lib/services/applicationService";
import { getGroupsByUser } from "@/lib/services/groupService";

interface UserDetailsProps {
  userId: string;
}

const UserDetails: React.FC<UserDetailsProps> = ({ userId }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userGroups, setUserGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [userApps, setUserApps] = useState<UserApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const userData = await getUserById(userId);
        
        if (userData) {
          setUser(userData);
          
          // Cargar grupos del usuario
          try {
            const groupsData = await getGroupsByUser(userId);
            console.log("Grupos del usuario:", groupsData);
            setUserGroups(groupsData);
          } catch (groupError) {
            console.error("Error al obtener los grupos del usuario:", groupError);
            // No establecemos el error principal para no bloquear la página
          }
          
          // Cargar aplicaciones del usuario
          try {
            const appsData = await getUserApplications(userId);
            setUserApps(appsData);
          } catch (appError) {
            console.error("Error al obtener las aplicaciones del usuario:", appError);
            // No establecemos el error principal para no bloquear la página
          }
        } else {
          setError("Usuario no encontrado");
        }
      } catch (err: any) {
        console.error("Error al cargar los detalles del usuario:", err);
        setError(err.response?.data?.message || "Error al cargar los detalles del usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error("Error al formatear la fecha:", error);
      return dateString || 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => router.back()}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Aviso: </strong>
          <span className="block sm:inline">No se encontró información del usuario</span>
        </div>
        <button
          onClick={() => router.back()}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Encabezado y acciones */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detalles del Usuario</h1>
          <p className="text-gray-500 dark:text-gray-400">{user.username}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          <Link href={`/users/edit/${user.id}`}>
            <button 
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
              Editar
            </button>
          </Link>
          <button
            onClick={() => router.back()}
            className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-gray-800"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver
          </button>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información personal</h2>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</p>
              <p className="text-gray-900 dark:text-white text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 overflow-auto">{user.id}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre de usuario</p>
              <p className="text-gray-900 dark:text-white">{user.username}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Correo electrónico</p>
              <p className="text-gray-900 dark:text-white">{user.email}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre completo</p>
              <p className="text-gray-900 dark:text-white">{user.first_name} {user.last_name}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información del sistema</h2>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</p>
              <div className="flex items-center mt-1">
                <div className={`h-3 w-3 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"} mr-2`}></div>
                <p className="text-gray-900 dark:text-white">{user.is_active ? "Activo" : "Desactivado"}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de creación</p>
              <p className="text-gray-900 dark:text-white">{formatDate(user.created_at)}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Último acceso</p>
              <p className="text-gray-900 dark:text-white">{formatDate(user.last_login_date)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de grupos */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Grupos asignados</h2>
        
        {userGroups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {userGroups.map(group => (
              <div 
                key={group.id} 
                className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex items-center"
              >
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span className="text-gray-900 dark:text-white">{group.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              El usuario no está asignado a ningún grupo
            </p>
          </div>
        )}
      </div>

      {/* Sección de aplicaciones */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aplicaciones asignadas</h2>
        
        {userApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userApps.map((app, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-center mb-2">
                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{app.name}</h3>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {app.description || "Sin descripción disponible"}
                  </p>
                  
                  {app.url && (
                    <a 
                      href={app.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center text-sm font-medium"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                      Abrir aplicación
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              El usuario no tiene aplicaciones asignadas
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default UserDetails;