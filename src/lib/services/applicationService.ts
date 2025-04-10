import api from "./api";

export interface Application {
  id: string;
  name: string;
  application_key: string;
  description: string;
  version: string;
  is_active: boolean;
  created_at: string;
}

export interface ApplicationCreate {
  name: string;
  application_key: string;
  description: string;
  version: string;
}

export interface UserApplication {
  id: string;
  name: string;
  description: string;
  url: string;
  is_active: boolean;
}

export interface UserApplicationAssignment {
  id: string;
  user_id: string;
  application_id: string;
  is_active: boolean;
  created_at: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface UserApplicationAssignmentRequest {
  user_id: string;
  app_id: string; // Nombre de campo según la API
  is_active: boolean;
}

export interface UserApplicationAssignmentResponse {
  user_id: string;
  app_id: string; // Nombre de campo según la API
  is_active: boolean;
  created_at: string;
}

export const getApplications = async (skip: number = 0, limit: number = 100): Promise<Application[]> => {
  try {
    const response = await api.get<Application[]>(`/applications?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las aplicaciones", error);
    throw error;
  }
};

export const getApplicationById = async (id: string): Promise<Application | null> => {
  try {
    const response = await api.get<Application>(`/applications/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn(`Aplicación con ID ${id} no encontrada.`);
      return null; 
    }
    console.error(`Error al obtener aplicación ${id}:`, error);
    throw error;
  }
};

export const createApplication = async (applicationData: ApplicationCreate): Promise<Application> => {
  try {
    const response = await api.post<Application>("/applications", applicationData);
    return response.data;
  } catch (error) {
    console.error("Error al crear la aplicación:", error);
    throw error;
  }
};

export const updateApplication = async (
  applicationId: string,
  data: Partial<ApplicationCreate>
): Promise<Application> => {
  try {
    const response = await api.put<Application>(`/applications/${applicationId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar la aplicación ${applicationId}:`, error);
    throw error;
  }
};

export const deactivateApplication = async (applicationId: string): Promise<Application> => {
  try {
    const response = await api.patch<Application>(`/applications/${applicationId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error al desactivar la aplicación ${applicationId}:`, error);
    throw error;
  }
};

export const activateApplication = async (applicationId: string): Promise<Application> => {
  try {
    const response = await api.patch<Application>(`/applications/${applicationId}/activate`);
    return response.data;
  } catch (error) {
    console.error(`Error al activar la aplicación ${applicationId}:`, error);
    throw error;
  }
};

/**
 * Obtiene las aplicaciones a las que tiene acceso un usuario
 * @param userId ID del usuario
 * @returns Lista de aplicaciones con nombre, descripción, URL y estado
 */
export const getUserApplications = async (userId: string): Promise<UserApplication[]> => {
  try {
    console.log(`Obteniendo aplicaciones para el usuario: ${userId}`);
    const response = await api.get<UserApplication[]>(`/user-application/user/${userId}/apps`);
    
    // Log para depuración
    console.log("Aplicaciones recibidas:", response.data);
    
    // Aseguramos que cada aplicación tenga las propiedades necesarias
    const applications = response.data.map(app => ({
      id: app.id || "",
      name: app.name || "",
      description: app.description || "",
      url: app.url || "",
      is_active: typeof app.is_active === 'boolean' ? app.is_active : true
    }));
    
    return applications;
  } catch (error: any) {
    console.error(`Error al obtener las aplicaciones del usuario ${userId}:`, error);
    
    // Información más detallada del error
    if (error.response) {
      console.error("Detalles de la respuesta del servidor:", {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    throw error;
  }
};

/**
 * Obtiene todas las asignaciones entre usuarios y aplicaciones
 * @param skip Número de registros a omitir
 * @param limit Número máximo de registros a devolver
 * @returns Lista de asignaciones entre usuarios y aplicaciones
 */
export const getUserApplicationAssignments = async (skip: number = 0, limit: number = 100): Promise<UserApplicationAssignment[]> => {
  try {
    const response = await api.get<any[]>(`/user-application?skip=${skip}&limit=${limit}`);
    
    // Mapear la respuesta al formato esperado por la aplicación
    return response.data.map(item => ({
      id: item.id || `${item.user_id}-${item.app_id}`, // Generar un ID si no existe
      user_id: item.user_id,
      application_id: item.app_id, // Mapear app_id a application_id para mantener compatibilidad
      is_active: item.is_active,
      created_at: item.created_at,
      created_by: item.created_by,
      updated_at: item.updated_at,
      updated_by: item.updated_by
    }));
  } catch (error) {
    console.error("Error al obtener las asignaciones de aplicaciones a usuarios:", error);
    throw error;
  }
};

/**
 * Crea nuevas asignaciones de usuarios a aplicaciones
 * @param assignments Asignaciones a crear (puede ser un objeto individual o un array)
 * @returns Las asignaciones creadas con sus timestamps
 */
export const createUserApplicationAssignments = async (
  assignments: UserApplicationAssignmentRequest | UserApplicationAssignmentRequest[]
): Promise<UserApplicationAssignmentResponse[]> => {
  try {
    const assignmentsArray = Array.isArray(assignments) ? assignments : [assignments];
    
    // Asegurarnos que los datos están en el formato correcto para la API
    const formattedAssignments = assignmentsArray.map(assignment => ({
      user_id: assignment.user_id,
      app_id: assignment.app_id,
      is_active: assignment.is_active
    }));
    
    console.log("Enviando asignaciones al endpoint:", formattedAssignments);
    
    const response = await api.post<UserApplicationAssignmentResponse[]>(
      "/user-application/",
      formattedAssignments
    );
    
    console.log("Respuesta del servidor:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al crear asignaciones de usuarios a aplicaciones:", error);
    throw error;
  }
};