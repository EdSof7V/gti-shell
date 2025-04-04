"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  getApplications,
  getUserApplicationAssignments,
  UserApplicationAssignment,
  createUserApplicationAssignments
} from "@/lib/services/applicationService";
import { getGroups, getGroupUsers, GroupUserInfo } from "@/lib/services/groupService";
import GroupSummary from "./assignment/GroupSummary";

// Tipos base
type AppInfo = {
  id: string;
  key: string;
  name: string;
  emoji: string;
};

type UserInfo = {
  id: string;
  fullName: string;
};

type GroupInfo = {
  id: string;
  name: string;
};

// Para asignaciones
type Assignment = {
  userId: string;
  appId: string;
  isActive: boolean;
  id?: string; // ID original de la asignación (si existe)
};

// Estructura principal para el grupo activo
type GroupUserMap = {
  [groupId: string]: UserInfo[];
};

export default function AppAssignment() {
  // Estado base
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [groupUserMap, setGroupUserMap] = useState<GroupUserMap>({});
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Estado para rastrear las asignaciones originales y detectar cambios
  const [originalAssignments, setOriginalAssignments] = useState<Assignment[]>([]);
  
  // Carga inicial de datos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Cargamos los datos en paralelo para reducir el tiempo de espera
        const [groupsResponse, appsResponse, assignmentsResponse] = await Promise.allSettled([
          getGroups(0, 100),
          getApplications(0, 100),
          getUserApplicationAssignments(0, 1000)
        ]);

        // Procesar grupos
        let loadedGroups: GroupInfo[] = [];
        if (groupsResponse.status === 'fulfilled') {
          loadedGroups = groupsResponse.value.map(group => ({
            id: group.id,
            name: group.name
          }));
          setGroups(loadedGroups);

          // Seleccionar el primer grupo automáticamente
          if (loadedGroups.length > 0) {
            setActiveGroupId(loadedGroups[0].id);
          }

          // Inicializar el mapa de usuarios por grupo (se completará después)
          const userMap: GroupUserMap = {};
          loadedGroups.forEach(group => {
            userMap[group.id] = [];
          });
          setGroupUserMap(userMap);
        } else {
          console.error("Error cargando grupos:", groupsResponse.reason);
          setError("Error al cargar grupos. Puede que algunos datos no se muestren correctamente.");
          loadedGroups = [];
        }

        // Procesar aplicaciones
        let appsList: AppInfo[] = [];
        if (appsResponse.status === 'fulfilled') {
          appsList = appsResponse.value.map(app => ({
            id: app.id,
            key: app.application_key || app.name.substring(0, 3).toUpperCase(),
            name: app.name,
            emoji: getAppEmoji(app.application_key)
          }));
          setApps(appsList);
        } else {
          console.error("Error cargando aplicaciones:", appsResponse.reason);
          setError(error => (error ? error + "\n" : "") + "Error al cargar aplicaciones");
          appsList = [];
        }

        // Procesar asignaciones
        if (assignmentsResponse.status === 'fulfilled') {
          console.log("Asignaciones cargadas:", assignmentsResponse.value);
          const assignmentsList: Assignment[] = assignmentsResponse.value
            .map(assignment => ({
              userId: assignment.user_id,
              appId: assignment.application_id, // Ya mapeado en el servicio
              isActive: assignment.is_active,
              id: assignment.id
            }));
          
          // Guardar las asignaciones originales para detectar cambios
          setOriginalAssignments([...assignmentsList]);
          setAssignments(assignmentsList);
          console.log("Estado de asignaciones actualizado:", assignmentsList);
        } else {
          console.error("Error cargando asignaciones:", assignmentsResponse.reason);
          setError(error => (error ? error + "\n" : "") + "Error al cargar asignaciones");
        }

        // Si tenemos grupos, cargamos los usuarios para el primer grupo seleccionado
        if (loadedGroups.length > 0) {
          const firstGroupId = loadedGroups[0].id;
          await loadUsersForGroup(firstGroupId);
        }

      } catch (err) {
        console.error("Error general cargando datos:", err);
        setError("Error al cargar los datos. Algunas funcionalidades pueden no estar disponibles.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Cargar usuarios para un grupo específico
  const loadUsersForGroup = async (groupId: string) => {
    if (!groupId) return;

    try {
      // Utilizamos el endpoint existente para obtener usuarios de un grupo
      const groupUsers = await getGroupUsers(groupId);

      // Mapeamos a nuestro formato
      const usersList: UserInfo[] = groupUsers.map((user: GroupUserInfo) => ({
        id: user.id,
        fullName: `${user.name} ${user.lastname}`
      }));

      // Actualizamos el mapa de usuarios por grupo
      setGroupUserMap(prevMap => ({
        ...prevMap,
        [groupId]: usersList
      }));

    } catch (err) {
      console.error(`Error al cargar usuarios para el grupo ${groupId}:`, err);
      // No establecemos error global para este caso, solo mostramos un grupo vacío
    }
  };

  // Efecto para cargar usuarios cuando cambia el grupo activo
  useEffect(() => {
    if (activeGroupId && (!groupUserMap[activeGroupId] || groupUserMap[activeGroupId].length === 0)) {
      loadUsersForGroup(activeGroupId);
    }
  }, [activeGroupId, groupUserMap]);

  // Usuarios del grupo activo
  const activeGroupUsers = useMemo(() => {
    return groupUserMap[activeGroupId] || [];
  }, [groupUserMap, activeGroupId]);

  // Función para obtener emoji según tipo de aplicación
  function getAppEmoji(appKey?: string): string {
    const appEmojis: Record<string, string> = {
      DM: "📊", APM: "📈", CRM: "👥", UM: "👤", GTI: "🔐", GDT: "🗂️", IAM: "🔑"
    };
    return appKey ? (appEmojis[appKey] || "🔄") : "🔄";
  }

  // Verificar si una aplicación está habilitada para el grupo actual
  const isAppEnabledForGroup = (appId: string): boolean => {
    if (!activeGroupId) return false;

    // Obtener IDs de usuarios en el grupo activo
    const userIds = activeGroupUsers.map(user => user.id);

    // Verificar si al menos un usuario tiene la app asignada
    const enabled = assignments.some(
      assignment => assignment.isActive &&
        assignment.appId === appId &&
        userIds.includes(assignment.userId)
    );

    return enabled;
  };

  // Verificar si un usuario tiene una aplicación asignada
  const isAppAssignedToUser = (userId: string, appId: string): boolean => {
    const isAssigned = assignments.some(
      assignment => assignment.userId === userId &&
        assignment.appId === appId &&
        assignment.isActive
    );

    return isAssigned;
  };

  // Activar/desactivar app para grupo entero
  const toggleAppForGroup = (appId: string) => {
    const isCurrentlyEnabled = isAppEnabledForGroup(appId);
    const userIds = activeGroupUsers.map(user => user.id);

    setAssignments(prevAssignments => {
      // Crear copia de las asignaciones actuales
      let newAssignments = [...prevAssignments];

      if (isCurrentlyEnabled) {
        // Desactivar para todos los usuarios del grupo
        newAssignments = newAssignments.map(assignment => {
          if (assignment.appId === appId && userIds.includes(assignment.userId)) {
            return { ...assignment, isActive: false };
          }
          return assignment;
        });
      } else {
        // Primero eliminar asignaciones existentes que estén inactivas
        newAssignments = newAssignments.filter(
          assignment => !(assignment.appId === appId &&
            userIds.includes(assignment.userId) &&
            !assignment.isActive)
        );

        // Luego, para cada usuario:
        userIds.forEach(userId => {
          // Verificar si ya existe una asignación activa
          const existingAssignment = newAssignments.find(
            a => a.userId === userId && a.appId === appId && a.isActive
          );

          // Si no existe, crearla
          if (!existingAssignment) {
            newAssignments.push({
              userId,
              appId,
              isActive: true
            });
          }
        });
      }

      return newAssignments;
    });
  };

  // Activar/desactivar app para un usuario específico
  const toggleAppForUser = (userId: string, appId: string) => {
    const isCurrentlyAssigned = isAppAssignedToUser(userId, appId);

    setAssignments(prevAssignments => {
      // Buscar si ya existe una asignación
      const existingAssignmentIndex = prevAssignments.findIndex(
        a => a.userId === userId && a.appId === appId
      );

      // Crear copia para modificar
      let newAssignments = [...prevAssignments];

      if (existingAssignmentIndex >= 0) {
        // Si existe, invertir su estado
        newAssignments[existingAssignmentIndex] = {
          ...newAssignments[existingAssignmentIndex],
          isActive: !isCurrentlyAssigned
        };
      } else {
        // Si no existe, crear una nueva asignación
        newAssignments.push({
          userId,
          appId,
          isActive: true
        });
      }

      return newAssignments;
    });
  };

  // Cambiar el grupo activo
  const handleGroupChange = (groupId: string) => {
    setActiveGroupId(groupId);
  };

  // Preparar datos para el resumen de asignaciones
  const generateSummary = () => {
    // Para cada grupo, calcular estadísticas por aplicación
    return groups.map(group => {
      const groupUsers = groupUserMap[group.id] || [];
      const totalUsers = groupUsers.length;
      const userIds = groupUsers.map(user => user.id);

      // Para cada aplicación, contar asignaciones en este grupo
      const appStats = apps.map(app => {
        // Contar cuántos usuarios del grupo tienen esta app
        const count = assignments.filter(
          a => a.isActive && a.appId === app.id && userIds.includes(a.userId)
        ).length;

        return {
          app: app.key,
          count,
          total: totalUsers,
          percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0
        };
      });

      return {
        grupo: group.name,
        apps: appStats,
        totalUsers
      };
    });
  };

  // Obtener solo las asignaciones que han cambiado
  const getChangedAssignments = () => {
    const changedAssignments = [];
    
    // Primero, buscar asignaciones modificadas (cambios de estado activo/inactivo)
    for (const currentAssignment of assignments) {
      // Buscar esta asignación en las originales
      const originalAssignment = originalAssignments.find(
        original => original.userId === currentAssignment.userId && 
                    original.appId === currentAssignment.appId
      );
      
      // Si no se encuentra en las originales y está activa, es una nueva asignación
      if (!originalAssignment && currentAssignment.isActive) {
        changedAssignments.push({
          user_id: currentAssignment.userId,
          app_id: currentAssignment.appId,
          is_active: true
        });
      }
      // Si se encuentra y ha cambiado su estado, es una modificación
      else if (originalAssignment && originalAssignment.isActive !== currentAssignment.isActive) {
        changedAssignments.push({
          user_id: currentAssignment.userId,
          app_id: currentAssignment.appId,
          is_active: currentAssignment.isActive
        });
      }
    }
    
    // Ahora, revisar si hay alguna asignación original que ya no existe
    // Esto no debería ocurrir en la implementación actual, pero lo incluimos por si acaso
    for (const originalAssignment of originalAssignments) {
      const stillExists = assignments.some(
        current => current.userId === originalAssignment.userId && 
                   current.appId === originalAssignment.appId
      );
      
      if (!stillExists && originalAssignment.isActive) {
        // Si ya no existe y estaba activa, la registramos como inactiva
        changedAssignments.push({
          user_id: originalAssignment.userId,
          app_id: originalAssignment.appId,
          is_active: false
        });
      }
    }
    
    return changedAssignments;
  };

  const handleSave = async () => {
    try {
      setSaveStatus('loading');
      const changedAssignments = getChangedAssignments();
      console.log("Asignaciones modificadas a guardar:", changedAssignments);
      
      if (changedAssignments.length === 0) {
        alert("No hay cambios que guardar");
        setSaveStatus('idle');
        return;
      }

      // Enviar solo los cambios al backend
      const savedAssignments = await createUserApplicationAssignments(changedAssignments);
      console.log("Asignaciones guardadas exitosamente:", savedAssignments);

      // Actualizar las asignaciones originales para reflejar el nuevo estado
      setOriginalAssignments([...assignments]);
      
      setSaveStatus('success');
      alert(`${changedAssignments.length} asignaciones guardadas correctamente`);
    } catch (error) {
      console.error("Error al guardar las asignaciones:", error);
      setSaveStatus('error');
      alert(`Error al guardar las asignaciones: ${error.message || "Por favor, inténtelo de nuevo."}`);
    } finally {
      // Volver al estado inicial después de 3 segundos
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };

  // Pantalla de carga
  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Mostrar advertencia si hubo problemas */}
      {error && (
        <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Advertencia: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="groupSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Grupo seleccionado
        </label>
        <select
          id="groupSelect"
          value={activeGroupId}
          onChange={(e) => handleGroupChange(e.target.value)}
          className="block w-full md:w-64 rounded-md border-gray-300 shadow-sm p-2 bg-white dark:bg-gray-800 dark:border-gray-700"
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <div className="w-32 font-medium">Aplicaciones:</div>
        <div className="flex flex-wrap gap-4">
          {apps.map(app => {
            const isEnabled = isAppEnabledForGroup(app.id);
            return (
              <div key={app.id}
                className={`flex flex-col items-center p-2 rounded ${isEnabled ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'
                  }`}
              >
                <span className="text-xl mb-1">{app.emoji}</span>
                <span className={`font-medium ${isEnabled ? 'text-blue-600 dark:text-blue-400' : ''}`}>{app.key}</span>
                <label className="flex items-center mt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => toggleAppForGroup(app.id)}
                    className="h-4 w-4 rounded"
                  />
                  <span className="ml-1 text-xs">Activar</span>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Usuario
              </th>
              {apps.map(app => (
                <th key={app.id} scope="col" className="px-1 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {app.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {activeGroupUsers.length > 0 ? (
              activeGroupUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {user.fullName}
                  </td>
                  {apps.map(app => {
                    const isAssigned = isAppAssignedToUser(user.id, app.id);

                    return (
                      <td key={`${user.id}-${app.id}`} className="px-1 py-1 whitespace-nowrap text-center">
                        <label className="inline-flex justify-center">
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => toggleAppForUser(user.id, app.id)}
                            className="h-4 w-4 rounded cursor-pointer"
                          />
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={apps.length + 1} className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No hay usuarios en este grupo o se están cargando...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        className={`mt-6 px-4 py-2 rounded-lg text-white transition-colors ${
          saveStatus === 'loading' 
            ? 'bg-blue-400 cursor-not-allowed' 
            : saveStatus === 'success' 
              ? 'bg-green-600 hover:bg-green-700' 
              : saveStatus === 'error' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
        }`}
        onClick={handleSave}
        disabled={saveStatus === 'loading'}
      >
        {saveStatus === 'loading' ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Guardando...
          </span>
        ) : saveStatus === 'success' ? (
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            ¡Guardado!
          </span>
        ) : saveStatus === 'error' ? (
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Error al guardar
          </span>
        ) : (
          'Guardar Asignaciones'
        )}
      </button>

      <div className="mt-8 border-t pt-6 border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Resumen de asignaciones</h3>

        <GroupSummary
          summary={generateSummary()}
          applications={apps}
        />
      </div>
    </div>
  );
}