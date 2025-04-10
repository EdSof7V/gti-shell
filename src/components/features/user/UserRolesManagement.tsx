"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserApplications, UserApplication } from "@/lib/services/applicationService";
import { 
  getRolesByApplicationId, 
  ApplicationRole, 
  createUserApplicationRoles, 
  getUserApplicationRoles,
  UserApplicationRole,
  UserApplicationRoleRequest
} from "@/lib/services/applicationRoleService";
import { getRoles, Role } from "@/lib/services/roleService";

interface UserRolesManagementProps {
  userId: string;
}

const UserRolesManagement: React.FC<UserRolesManagementProps> = ({ userId }) => {
  console.log("UserRolesManagement inicializado con userId:", userId);
  const router = useRouter();
  const [userApplications, setUserApplications] = useState<UserApplication[]>([]);
  const [applicationRoles, setApplicationRoles] = useState<ApplicationRole[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [userAppRoles, setUserAppRoles] = useState<Map<string, boolean>>(new Map());
  const [userRolesByApp, setUserRolesByApp] = useState<Record<string, UserApplicationRole[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string>("");

  // Efecto inicial para cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("UserRolesManagement - userId recibido:", userId);
        
        if (!userId) {
          console.error("UserRolesManagement - No se recibió userId");
          setError("No se pudo identificar el usuario");
          setLoading(false);
          return;
        }
        
        setLoading(true);
        setError(null);

        // Primero cargamos las aplicaciones y roles
        try {
          // Cargar aplicaciones del usuario y roles generales
          const [userAppsData, rolesData] = await Promise.all([
            getUserApplications(userId),
            getRoles(0, 500)
          ]);
          
          console.log("Aplicaciones obtenidas:", userAppsData);
          console.log("Roles obtenidos:", rolesData);

          setUserApplications(userAppsData);
          setAllRoles(rolesData);

          // Seleccionar la primera aplicación activa por defecto si existe
          const activeApps = userAppsData.filter(app => app.is_active);
          if (activeApps.length > 0) {
            setSelectedAppId(activeApps[0].id);
          } else if (userAppsData.length > 0) {
            // Si no hay apps activas, usar la primera de todas formas
            setSelectedAppId(userAppsData[0].id);
          }
        } catch (appError) {
          console.error("Error al cargar aplicaciones o roles:", appError);
          setError("Error al cargar las aplicaciones. Por favor, intente nuevamente.");
        }

        // Luego, intentamos cargar los roles de aplicación del usuario utilizando el endpoint correcto
        try {
          // Utilizamos el endpoint correcto para obtener los roles de aplicación del usuario
          const userAppRolesData = await getUserApplicationRoles(userId);
          console.log("Roles de aplicación del usuario:", userAppRolesData);

          // Organizar los roles del usuario por aplicación
          const rolesByApp: Record<string, UserApplicationRole[]> = {};
          userAppRolesData.forEach(role => {
            if (!rolesByApp[role.application_id]) {
              rolesByApp[role.application_id] = [];
            }
            rolesByApp[role.application_id].push(role);
          });
          setUserRolesByApp(rolesByApp);
        } catch (rolesError) {
          console.error("Error al cargar roles de aplicación del usuario:", rolesError);
          // No bloqueamos toda la interfaz si falla esta parte
        }
      } catch (err: any) {
        console.error("Error general al cargar datos:", err);
        setError("Error al cargar los datos. Por favor, intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Efecto para cargar los roles específicos cuando cambia la aplicación seleccionada
  useEffect(() => {
    if (!selectedAppId) return;
    
    const fetchAppRoles = async () => {
      try {
        setLoading(true);
        
        // Obtener roles específicos para esta aplicación
        const appRoles = await getRolesByApplicationId(selectedAppId);
        setApplicationRoles(appRoles);
        
        console.log("Roles de la aplicación:", appRoles);
        
        // Obtener los roles del usuario para esta aplicación específica
        const userRolesForApp = userRolesByApp[selectedAppId] || [];
        console.log("Roles del usuario para esta aplicación:", userRolesForApp);
        
        // Establecer los IDs de roles que el usuario ya tiene asignados con su estado activo/inactivo
        const roleStatusMap = new Map<string, boolean>();
        
        // Inicializar todos los roles como inactivos
        appRoles.forEach(role => {
          roleStatusMap.set(role.role_id, false);
        });
        
        // Actualizar con el estado de los roles asignados al usuario
        userRolesForApp.forEach(userRole => {
          roleStatusMap.set(userRole.role_id, userRole.is_active);
        });
        
        setUserAppRoles(roleStatusMap);
        
      } catch (err) {
        console.error("Error al cargar roles de la aplicación:", err);
        // No establecemos el error global para no bloquear la interfaz
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppRoles();
  }, [selectedAppId, userRolesByApp]);

  // Manejadores de eventos
  const handleAppChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAppId(e.target.value);
    console.log("Aplicación seleccionada:", e.target.value);
  };

  const handleRoleToggle = (roleId: string) => {
    setUserAppRoles(prev => {
      const newMap = new Map(prev);
      // Si ya está en el Map, invertimos su valor
      const currentValue = prev.get(roleId) || false;
      newMap.set(roleId, !currentValue);
      return newMap;
    });
  };

  const handleAssignRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      if (!selectedAppId) {
        setError("Debe seleccionar una aplicación");
        setLoading(false);
        return;
      }
      
      // Preparar datos para la API - incluimos TODOS los roles con su estado
      const requests: UserApplicationRoleRequest[] = [];
      
      applicationRoles.forEach(appRole => {
        const isActive = userAppRoles.get(appRole.role_id) || false;
        
        // Solo incluimos los roles que están en nuestro Map (los que han sido vistos)
        if (userAppRoles.has(appRole.role_id)) {
          requests.push({
            user_id: userId,
            application_id: selectedAppId,
            role_id: appRole.role_id,
            user_application_role_key: appRole.application_role_key,
            is_active: isActive
          });
        }
      });
      
      if (requests.length === 0) {
        setError("No hay cambios para guardar");
        setLoading(false);
        return;
      }
      
      console.log("Actualizando asignación de roles:", requests);
      
      try {
        // Llamar al endpoint para crear/actualizar roles
        const result = await createUserApplicationRoles(requests);
        console.log("Respuesta de asignación de roles:", result);
        
        // Después de la operación, refrescar los roles del usuario
        // para tener la información actualizada
        const refreshedUserRoles = await getUserApplicationRoles(userId);
        console.log("Roles actualizados del usuario:", refreshedUserRoles);
        
        // Organizar los roles actualizados por aplicación
        const updatedRolesByApp: Record<string, UserApplicationRole[]> = {};
        refreshedUserRoles.forEach(role => {
          if (!updatedRolesByApp[role.application_id]) {
            updatedRolesByApp[role.application_id] = [];
          }
          updatedRolesByApp[role.application_id].push(role);
        });
        
        // Actualizar el estado con los roles actualizados
        setUserRolesByApp(updatedRolesByApp);
        
        // Actualizar también el mapeo de roles activos para la aplicación actual
        const newRoleMap = new Map<string, boolean>();
        applicationRoles.forEach(appRole => {
          const userRole = refreshedUserRoles.find(
            r => r.application_id === selectedAppId && r.role_id === appRole.role_id
          );
          newRoleMap.set(appRole.role_id, userRole?.is_active || false);
        });
        setUserAppRoles(newRoleMap);
        
        // Mostrar mensaje de éxito
        setSuccessMessage("Roles actualizados correctamente");
        
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } catch (err) {
        console.error("Error en la respuesta al asignar roles:", err);
        setError("Error al procesar la asignación de roles. Por favor, intente nuevamente.");
      }
    } catch (err: any) {
      console.error("Error general al asignar roles:", err);
      setError("Se produjo un error inesperado. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares
  const getSelectedApp = (): UserApplication | undefined => {
    return userApplications.find(app => app.id === selectedAppId);
  };
  
  const isRoleAssigned = (roleId: string): boolean => {
    return userAppRoles.get(roleId) || false;
  };
  
  const getRoleInfo = (roleId: string): Role | undefined => {
    return allRoles.find(role => role.id === roleId);
  };

  // Renderizado condicional para estados de carga y error
  if (loading && !userApplications.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !userApplications.length) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestionar Roles por Aplicación</h1>
          <p className="text-gray-500 dark:text-gray-400">
            ID Usuario: {userId}
          </p>
        </div>
        <Link href="/admin/users">
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded inline-flex items-center dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Usuarios
          </button>
        </Link>
      </div>

      {/* Mensajes de error y éxito */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">¡Éxito! </strong>
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      {/* Contenido principal */}
      {userApplications.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded-lg mb-6">
          <p className="font-medium">El usuario no tiene aplicaciones asignadas.</p>
          <p className="mt-2">Primero debe asignar aplicaciones al usuario antes de gestionar sus roles.</p>
        </div>
      ) : (
        <div>
          {/* Selector de aplicación */}
          <div className="mb-6">
            <label htmlFor="appSelect" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Seleccione una aplicación:
            </label>
            <select
              id="appSelect"
              value={selectedAppId}
              onChange={handleAppChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              {userApplications
                .filter(app => app.is_active)
                .map(app => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))
              }
            </select>
          </div>

          {/* Detalles de la aplicación seleccionada */}
          {selectedAppId && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Aplicación seleccionada: {getSelectedApp()?.name}
                </h2>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                {/* Información de la aplicación */}
                <div className="flex flex-col space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Información de la aplicación:</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {getSelectedApp()?.description || "Sin descripción"}
                    </p>
                  </div>
                </div>
                
                {/* Sección de roles */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Roles disponibles para esta aplicación:</h3>
                  
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : applicationRoles.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No hay roles definidos para esta aplicación
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {applicationRoles.map(appRole => {
                        const roleInfo = getRoleInfo(appRole.role_id);
                        const isActive = isRoleAssigned(appRole.role_id);
                        const existingUserRole = userRolesByApp[selectedAppId]?.find(
                          ur => ur.role_id === appRole.role_id
                        );
                        
                        let statusBadge = null;
                        if (existingUserRole) {
                          if (existingUserRole.is_active) {
                            statusBadge = (
                              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Asignado {new Date(existingUserRole.created_at).toLocaleDateString()}
                              </span>
                            );
                          } else {
                            statusBadge = (
                              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                Desactivado
                              </span>
                            );
                          }
                        }
                        
                        return (
                          <div 
                            key={appRole.role_id} 
                            className={`p-3 rounded-lg border ${
                              isActive
                                ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700'
                                : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                            } cursor-pointer`}
                            onClick={() => handleRoleToggle(appRole.role_id)}
                          >
                            <div className="flex items-start">
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={() => handleRoleToggle(appRole.role_id)}
                                className="w-4 h-4 mt-1 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div className="ml-3 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {roleInfo?.name || "Rol desconocido"}
                                  </h4>
                                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                    {appRole.application_role_key}
                                  </span>
                                  
                                  {statusBadge}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {roleInfo?.description || "Sin descripción"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Botón para asignar roles */}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAssignRoles}
                      disabled={loading}
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Guardando...
                        </span>
                      ) : (
                        'Guardar Roles'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserRolesManagement;