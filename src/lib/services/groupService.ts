import api from "./api";

export interface Group {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface GroupCreate {
  name: string;
  description: string;
}

export interface UserGroupDetail {
  id: string;
  name: string;
  description: string;
}

export interface GroupUserRelation {
  group_id: string;
  user_id: string;
}

export interface GroupUserResponse {
  group_id: string;
  user_id: string;
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupUserInfo {
  id: string;
  name: string;
  lastname: string;
  email?: string;
}

export const getGroups = async (skip: number = 0, limit: number = 100): Promise<Group[]> => {
  try {
    const response = await api.get<Group[]>(`/groups?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene los IDs de los grupos a los que pertenece un usuario
 * @param userId ID del usuario
 * @returns Array de IDs de grupos
 */
export const getUserGroupIds = async (userId: string): Promise<string[]> => {
  try {
    const response = await api.get<string[]>(`/group-user/user/${userId}/groups`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene los grupos a los que pertenece un usuario con información detallada
 * @param userId ID del usuario
 * @returns Array de objetos con información detallada de los grupos
 */
export const getGroupsByUser = async (userId: string): Promise<UserGroupDetail[]> => {
  try {
    // Primero obtenemos los IDs de los grupos
    const groupIds = await getUserGroupIds(userId);
    
    if (groupIds.length === 0) {
      return [];
    }
    
    // Luego obtenemos todos los grupos para poder mapear la información
    const allGroups = await getGroups();
    
    // Filtramos los grupos que pertenecen al usuario y mapeamos para obtener solo la información necesaria
    const userGroups = groupIds.map(groupId => {
      const groupInfo = allGroups.find(g => g.id === groupId);
      return {
        id: groupId,
        name: groupInfo?.name || 'Grupo desconocido',
        description: groupInfo?.description || 'Sin descripción'
      };
    });
    
    return userGroups;
  } catch (error) {
    console.error(`Error al obtener los grupos del usuario ${userId}:`, error);
    throw error;
  }
};

export const createGroup = async (groupData: GroupCreate): Promise<Group> => {
  try {
    const response = await api.post<Group>("/groups", groupData);
    return response.data;
  } catch (error) {
    console.error("Error al crear el grupo:", error);
    throw error;
  }
};

/**
 * Asigna un usuario a un grupo individual
 * @param userId ID del usuario
 * @param groupId ID del grupo
 * @returns Respuesta con la relación creada
 * @deprecated Usar addUsersToGroups para mejor rendimiento
 */
export const assignUserToGroup = async (userId: string, groupId: string): Promise<GroupUserResponse> => {
  try {
    const response = await api.post<GroupUserResponse[]>("/group-user/", {
      user_id: userId,
      group_id: groupId
    });
    return response.data[0];
  } catch (error) {
    console.error(`Error al asignar el usuario ${userId} al grupo ${groupId}:`, error);
    throw error;
  }
};

/**
 * Asigna múltiples usuarios a grupos en una sola operación
 * @param relations Array de relaciones usuario-grupo
 * @returns Array de respuestas con las relaciones creadas
 */
export const addUsersToGroups = async (relations: GroupUserRelation[]): Promise<GroupUserResponse[]> => {
  try {
    const response = await api.post<GroupUserResponse[]>("/group-user/", relations);
    return response.data;
  } catch (error) {
    console.error("Error al asignar usuarios a grupos:", error);
    throw error;
  }
};

/**
 * Asigna un único usuario a múltiples grupos en una sola operación
 * @param userId ID del usuario a asignar
 * @param groupIds Array con IDs de los grupos
 * @returns Array de respuestas con las relaciones creadas
 */
export const assignUserToGroups = async (userId: string, groupIds: string[]): Promise<GroupUserResponse[]> => {
  try {
    const relations = groupIds.map(groupId => ({
      user_id: userId,
      group_id: groupId
    }));
    
    return await addUsersToGroups(relations);
  } catch (error) {
    console.error(`Error al asignar el usuario ${userId} a múltiples grupos:`, error);
    throw error;
  }
};

export const updateGroup = async (groupId: string, groupData: Partial<GroupCreate>): Promise<Group> => {
  try {
    const response = await api.put<Group>(`/groups/${groupId}`, groupData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el grupo ${groupId}:`, error);
    throw error;
  }
};

/**
 * Obtiene los usuarios de un grupo
 * @param groupId ID del grupo
 * @returns Array de usuarios
 */
export const getUsersByGroup = async (groupId: string): Promise<User[]> => {
  try {
    const response = await api.get<User[]>(`/groups/${groupId}/users`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener los usuarios del grupo ${groupId}:`, error);
    throw error;
  }
};

/**
 * Obtiene información detallada de los usuarios de un grupo
 * @param groupId ID del grupo
 * @returns Array con información de usuarios
 */
export const getGroupUsers = async (groupId: string): Promise<GroupUserInfo[]> => {
  try {
    const response = await api.get<GroupUserInfo[]>(`/group-user/group/${groupId}/users/info`);
    console.log(`Usuarios obtenidos para el grupo ${groupId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la información de usuarios del grupo ${groupId}:`, error);
    throw error;
  }
};