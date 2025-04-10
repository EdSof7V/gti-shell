"use client";

import { useState, useEffect } from "react";
import { getUserById, User } from "@/lib/services/userService";
import { getUserApplications, UserApplication } from "@/lib/services/applicationService";
import { getGroupsByUser } from "@/lib/services/groupService";
import { useSession } from "@/context/SessionContext";
import { jwtDecode } from "jwt-decode";

// Tipo para datos decodificados del token JWT
interface DecodedToken {
  sub?: string;
  [key: string]: any;
}

const UserProfileDetails = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userGroups, setUserGroups] = useState<Array<{ id: string; name: string; description: string }>>([]);
  const [userApps, setUserApps] = useState<UserApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { session } = useSession();
  
  const decodedToken: DecodedToken | null = session?.accessToken 
    ? safelyDecodeToken(session.accessToken) 
    : null;
  
  const userId = decodedToken?.sub || null;

  function safelyDecodeToken(token: string): DecodedToken | null {
    try {
      return jwtDecode(token) as DecodedToken;
    } catch (error) {
      return null;
    }
  }

  useEffect(() => {
    const fetchUserProfileDetails = async () => {
      try {
        setLoading(true);
        
        if (!userId) {
          setError("No se pudo obtener el ID del usuario");
          return;
        }
        
        const userData = await getUserById(userId);
        
        if (userData) {
          setUser(userData);
          
          await Promise.all([
            fetchUserGroups(userId),
            fetchUserApps(userId)
          ]);
        } else {
          setError("Usuario no encontrado");
        }
      } catch (err: any) {
        handleError(err, "Error al cargar los detalles del usuario");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserGroups = async (id: string) => {
      try {
        const groupsData = await getGroupsByUser(id);
        setUserGroups(groupsData);
      } catch (groupError: any) {
        console.error("Error al obtener los grupos del usuario:", groupError);
      }
    };

    const fetchUserApps = async (id: string) => {
      try {
        const appsData = await getUserApplications(id);
        
        const activeApps = appsData.filter(app => !('is_active' in app) || app.is_active);
        setUserApps(activeApps);
      } catch (appError: any) {
        console.error("Error al obtener las aplicaciones del usuario:", appError);
      }
    };

    const handleError = (err: any, defaultMessage: string) => {
      console.error(defaultMessage, err);
      setError(err.response?.data?.message || defaultMessage);
    };

    if (userId) {
      fetchUserProfileDetails();
    } else {
      setLoading(false);
      setError("No se ha iniciado sesión o la sesión ha caducado");
    }
  }, [userId]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error al formatear la fecha:", error);
      return dateString || 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">Aviso: </strong>
        <span className="block sm:inline">{error || "No se encontró información del usuario"}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Información del Usuario</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre completo</p>
              <p className="text-gray-900 dark:text-white">{user.first_name} {user.last_name}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre de usuario</p>
              <p className="text-gray-900 dark:text-white">{user.username}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Correo electrónico</p>
              <p className="text-gray-900 dark:text-white">{user.email}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</p>
              <div className="flex items-center">
                <div className={`h-2.5 w-2.5 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"} mr-2`}></div>
                <p className="text-gray-900 dark:text-white">{user.is_active ? "Activo" : "Inactivo"}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de creación</p>
              <p className="text-gray-900 dark:text-white">{formatDate(user.created_at)}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Último acceso</p>
              <p className="text-gray-900 dark:text-white">{formatDate(user.last_login_date)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Grupos asignados</h2>
        
        {userGroups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {userGroups.map(group => (
              <div 
                key={group.id} 
                className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
              >
                <p className="font-medium text-gray-900 dark:text-white">{group.name}</p>
                {group.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{group.description}</p>
                )}
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

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aplicaciones asignadas</h2>
        
        {userApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userApps.map((app, index) => (
              <div 
                key={index} 
                className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">{app.name}</h3>
                {app.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {app.description}
                  </p>
                )}
                {app.url && (
                  <button 
                    onClick={() => window.open(app.url, '_blank', 'noopener,noreferrer')}
                    className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1.5 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800 transition-colors"
                    aria-label={`Ir a la aplicación ${app.name}`}
                  >
                    Ir a la aplicación
                  </button>
                )}
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
    </div>
  );
};

export default UserProfileDetails;