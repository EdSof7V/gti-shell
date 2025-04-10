import api from "./api";

export interface Role {
  id: string;
  name: string;
  description: string;
  role_code: string; // Nuevo campo añadido
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface RoleCreate {
  name: string;
  description: string;
  role_code: string; // Nuevo campo añadido
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

export interface PermissionAssignment {
  role_id: string;
  permission_id: string;
}

/**
 * Obtiene la lista de roles
 * @param skip Número de registros a omitir
 * @param limit Número máximo de registros a devolver
 * @returns Lista de roles
 */
export const getRoles = async (skip: number = 0, limit: number = 100): Promise<Role[]> => {
  try {
    const response = await api.get<Role[]>(`/roles?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los roles", error);
    throw error;
  }
};

/**
 * Obtiene un rol por su ID
 * @param id ID del rol
 * @returns Información del rol o null si no existe
 */
export const getRoleById = async (id: string): Promise<Role | null> => {
  try {
    const response = await api.get<Role>(`/roles/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn(`Rol con ID ${id} no encontrado.`);
      return null; 
    }
    console.error(`Error al obtener rol ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo rol
 * @param roleData Datos del rol a crear
 * @returns Rol creado
 */
export const createRole = async (roleData: RoleCreate): Promise<Role> => {
  try {
    const response = await api.post<Role>("/roles", roleData);
    return response.data;
  } catch (error) {
    console.error("Error al crear el rol:", error);
    throw error;
  }
};

/**
 * Actualiza un rol existente
 * @param roleId ID del rol a actualizar
 * @param roleData Datos del rol a actualizar
 * @returns Rol actualizado
 */
export const updateRole = async (roleId: string, roleData: Partial<RoleCreate>): Promise<Role> => {
  try {
    const response = await api.put<Role>(`/roles/${roleId}`, roleData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el rol ${roleId}:`, error);
    throw error;
  }
};

/**
 * Obtiene todos los permisos disponibles en el sistema
 * @param skip Número de registros a omitir
 * @param limit Número máximo de registros a devolver
 * @returns Lista de permisos
 */
export const getPermissions = async (skip: number = 0, limit: number = 100): Promise<Permission[]> => {
  try {
    const response = await api.get<Permission[]>(`/permissions?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los permisos", error);
    throw error;
  }
};

/**
 * Obtiene los permisos asignados a un rol
 * @param roleId ID del rol
 * @returns Lista de permisos asignados al rol
 */
export const getRolePermissions = async (roleId: string): Promise<Permission[]> => {
  try {
    const response = await api.get<Permission[]>(`/roles/${roleId}/permissions`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener los permisos del rol ${roleId}:`, error);
    throw error;
  }
};

/**
 * Asigna permisos a un rol
 * @param assignments Array de asignaciones de permisos a roles
 * @returns Resultado de la operación
 */
export const assignPermissionsToRole = async (assignments: PermissionAssignment[]): Promise<RolePermission[]> => {
  try {
    const response = await api.post<RolePermission[]>("/role-permission", assignments);
    return response.data;
  } catch (error) {
    console.error("Error al asignar permisos al rol:", error);
    throw error;
  }
};

/**
 * Elimina un permiso de un rol
 * @param roleId ID del rol
 * @param permissionId ID del permiso
 * @returns Resultado de la operación
 */
export const removePermissionFromRole = async (roleId: string, permissionId: string): Promise<void> => {
  try {
    await api.delete(`/role-permission/${roleId}/${permissionId}`);
  } catch (error) {
    console.error(`Error al eliminar el permiso ${permissionId} del rol ${roleId}:`, error);
    throw error;
  }
};