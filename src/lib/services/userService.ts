import api from "./api";

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: string;
  last_login_date: string | null;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export const getUsers = async (skip: number = 0, limit: number = 100): Promise<User[]> => {
  try {
    const response = await api.get<User[]>(`/users?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn(`Usuario con ID ${id} no encontrado.`);
      return null; 
    }
    console.error(`Error al obtener usuario ${id}:`, error);
    throw error;
  }
};

export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  try {
    const response = await api.post<User>("/users", userData);
    return response.data;
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const response = await api.get<User>(`/users/email/${email}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn(`Usuario con email ${email} no encontrado.`);
      return null;
    }
    console.error(`Error al obtener usuario con email ${email}:`, error);
    throw error; 
  }
};

export const updateUser = async (
  userId: string,
  data: Partial<Omit<User, "id" | "created_at" | "last_login_date">>
): Promise<User> => {
  try {
    const response = await api.put<User>(`/users/${userId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar usuario ${userId}:`, error);
    throw error;
  }
};

export const deactivateUser = async (userId: string): Promise<User> => {
  try {
    const response = await api.patch<User>(`/users/${userId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error al desactivar usuario ${userId}:`, error);
    throw error;
  }
};

export const activateUser = async (userId: string): Promise<User> => {
  try {
    const response = await api.patch<User>(`/users/${userId}/activate`);
    return response.data;
  } catch (error) {
    console.error(`Error al activar usuario ${userId}:`, error);
    throw error;
  }
};


