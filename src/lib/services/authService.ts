import api from "./api";

export interface UsernameValidationResponse {
  id: string;
  exists: boolean;
  is_new_user: boolean;
  mfa_is_actived: boolean;
  mfa_is_required: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  mfa_is_actived: boolean;
  mfa_is_required: boolean;
  is_new_user: boolean;
  created_at: string;
  last_login_date: string | null;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  mfa_is_actived?: boolean;
  mfa_is_required?: boolean;
  is_new_user?: boolean;
  last_login_date?: string;
  updated_by?: string;
}

/**
 * Valida si un nombre de usuario existe y devuelve su estado
 * @param username Nombre de usuario a validar
 * @returns Respuesta con el estado del usuario (existe, es nuevo, estado MFA)
 */
export const validateUsername = async (username: string): Promise<UsernameValidationResponse> => {
  try {
    const response = await api.post<UsernameValidationResponse>("/validator/username", { username });
    return response.data;
  } catch (error) {
    console.error("Error al validar el nombre de usuario:", error);
    throw error;
  }
};

/**
 * Inicia sesión con usuario y contraseña
 * @param username Nombre de usuario
 * @param password Contraseña
 * @returns Token de autenticación
 */
export const login = async (username: string, password: string): Promise<{ access_token: string }> => {
  try {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
};

/**
 * Actualiza los datos de un usuario existente
 * @param userId ID del usuario a actualizar
 * @param updateData Datos a actualizar
 * @returns Usuario actualizado
 */
export const updateUser = async (userId: string, updateData: UpdateUserRequest): Promise<User> => {
  try {
    const response = await api.put<User>(`/users/${userId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    throw error;
  }
};

/**
 * Actualiza la contraseña para un usuario nuevo o que requiere cambio
 * @param username Nombre de usuario
 * @param newPassword Nueva contraseña
 * @returns Estado de la operación
 */
export const setUserPassword = async (username: string, newPassword: string): Promise<{ success: boolean, message: string }> => {
  try {
    const response = await api.post("/auth/set-password", { username, new_password: newPassword });
    return response.data;
  } catch (error) {
    console.error("Error al establecer la contraseña:", error);
    throw error;
  }
};

/**
 * Cierra la sesión actual
 * @returns Estado de la operación
 */
export const logout = async (): Promise<{ success: boolean }> => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
};


/**
 * Actualiza la contraseña de un usuario nuevo y establece is_new_user a false
 * @param userId ID del usuario
 * @param newPassword Nueva contraseña
 * @returns Usuario actualizado
 */
export const updateNewUserPassword = async (userId: string, newPassword: string) => {
  try {
    // Solo enviamos los datos necesarios: password e is_new_user
    const updateData = {
      password: newPassword,
      is_new_user: false
    };
    
    const response = await api.put(`/users/${userId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar contraseña de usuario nuevo:", error);
    throw error;
  }
};