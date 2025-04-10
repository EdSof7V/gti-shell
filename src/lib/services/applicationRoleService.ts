import api from "./api";

export interface ApplicationRole {
  application_id: string;
  role_id: string;
  application_role_key: string;
  is_active: boolean;
  created_at: string;
}

export interface UserApplicationRoleRequest {
  user_id: string;
  application_id: string;
  role_id: string;
  user_application_role_key: string;
  is_active: boolean; // Agregamos este campo para poder desactivar roles
}
  
export interface UserApplicationRoleResponse {
  user_id: string;
  application_id: string;
  role_id: string;
  user_application_role_key: string;
  is_active: boolean;
  created_at: string;
}

export interface UserApplicationRole {
  user_id: string;
  application_id: string;
  role_id: string;
  user_application_role_key: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Obtiene todas las asociaciones entre aplicaciones y roles
 * @param skip Número de registros a omitir
 * @param limit Número máximo de registros a devolver
 * @returns Lista de asociaciones entre aplicaciones y roles
 */
export const getApplicationRoles = async (skip: number = 0, limit: number = 100): Promise<ApplicationRole[]> => {
  try {
    const response = await api.get<ApplicationRole[]>(`/application-roles?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los roles de aplicaciones:", error);
    throw error;
  }
};

/**
 * Obtiene los roles específicos para una aplicación usando el endpoint directo
 * @param applicationId ID de la aplicación
 * @returns Lista de roles asociados a la aplicación
 */
export const getRolesByApplicationId = async (applicationId: string): Promise<ApplicationRole[]> => {
  try {
    console.log(`Obteniendo roles para la aplicación con ID: ${applicationId}`);
    // Usar el endpoint específico para obtener roles por ID de aplicación
    const response = await api.get<ApplicationRole[]>(`/application-roles/application/${applicationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener los roles para la aplicación ${applicationId}:`, error);
    throw error;
  }
};

/**
 * Obtiene todas las asignaciones de aplicaciones y roles para un usuario específico
 * @param userId ID del usuario
 * @returns Lista de asignaciones de roles por aplicación para el usuario
 */
export const getUserApplicationRoles = async (userId: string): Promise<UserApplicationRole[]> => {
  try {
    console.log(`Obteniendo roles de aplicaciones para el usuario: ${userId}`);
    
    // Usar el endpoint correcto según la documentación
    const response = await api.get<UserApplicationRole[]>(`/user-application-roles/user/${userId}`);
    
    console.log("Roles de aplicaciones recibidos:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener roles de aplicaciones para el usuario ${userId}:`, error);
    // Para depuración, agregamos más información sobre el error
    if (error.response) {
      console.error("Detalles del error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error("No se recibió respuesta del servidor:", error.request);
    }
    throw error;
  }
};

/**
 * Verifica si un usuario tiene un rol específico para una aplicación
 * @param userId ID del usuario
 * @param applicationId ID de la aplicación
 * @param roleId ID del rol
 * @returns Booleano que indica si el usuario tiene el rol
 */
export const checkUserHasAppRole = async (userId: string, applicationId: string, roleId: string): Promise<boolean> => {
  try {
    // Obtener los roles del usuario
    const userRoles = await getUserApplicationRoles(userId);
    
    // Verificar si el usuario tiene el rol específico para la aplicación
    return userRoles.some(role => 
      role.application_id === applicationId && 
      role.role_id === roleId && 
      role.is_active
    );
  } catch (error) {
    console.error("Error al verificar el rol del usuario:", error);
    throw error;
  }
};

/**
 * Asigna roles a un usuario para aplicaciones específicas
 * @param data Datos de la asignación o array de asignaciones
 * @returns Las asignaciones creadas con timestamp
 */
export const createUserApplicationRoles = async (
  data: UserApplicationRoleRequest | UserApplicationRoleRequest[]
): Promise<UserApplicationRoleResponse[]> => {
  try {
    console.log("Creando/actualizando asignaciones de roles para aplicaciones:", data);
    
    // Asegurar que enviamos los datos según la estructura esperada por el endpoint
    // Convertir el input a un array si es un objeto individual
    const requestData = Array.isArray(data) ? data : [data];
    
    // Formateamos los datos para que coincidan exactamente con lo que espera el endpoint
    const formattedData = requestData.map(item => ({
      user_id: item.user_id,
      application_id: item.application_id,
      role_id: item.role_id,
      user_application_role_key: item.user_application_role_key,
      // is_active es opcional en el request pero necesario para la lógica interna
      is_active: item.is_active
    }));
    
    // Aseguramos que estamos usando la instancia correcta de API configurada
    const response = await api.post<UserApplicationRoleResponse[]>("/user-application-roles", formattedData);
    
    console.log("Respuesta de asignación de roles:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al asignar roles a usuarios para aplicaciones:", error);
    
    // Para depuración, agregamos más información sobre el error
    if (error.response) {
      console.error("Detalles del error:", {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error("No se recibió respuesta del servidor:", error.request);
    }
    
    throw error;
  }
};