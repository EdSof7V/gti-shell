import axios from "axios";

// Crear una instancia específica para el servicio de autenticación con tokens
const authApi = axios.create({
  baseURL: "https://acloud-br-gcp-gob-ti-auth-1028436318023.southamerica-west1.run.app",
  headers: {
    "Content-Type": "application/json"
  }
});

export interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

/**
 * Autentica al usuario y obtiene un token de acceso
 * @param username Nombre de usuario
 * @param password Contraseña
 * @returns Token de acceso y datos relacionados
 */
export const getAuthToken = async (username: string, password: string): Promise<TokenResponse> => {
  try {
    console.log("Enviando solicitud de autenticación:", { username, password });
    
    // Usar nuestro proxy en lugar del endpoint externo directamente
    const response = await axios.post<TokenResponse>(
      '/api/auth-proxy',
      { username, password },
      {
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw error;
  }
};