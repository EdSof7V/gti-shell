import axios from "axios";

const BASE_URL = "https://acloud-br-gcp-gob-ti-mfa-1028436318023.southamerica-west1.run.app";

export interface MFAGenerateResponse {
  username: string;
  secret: string;
  uri: string;
}

export interface MFAVerifyResponse {
  success: boolean;
  message?: string;
  status?: string;
}

/**
 * Genera un secreto TOTP para un usuario
 * @param username Nombre de usuario
 * @returns Datos de configuración MFA incluyendo secreto y URI
 */
export const generateMFASecret = async (username: string): Promise<MFAGenerateResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/api/generate`, { username });
    return response.data;
  } catch (error) {
    console.error("Error al generar secreto MFA:", error);
    throw error;
  }
};

/**
 * @param username Nombre de usuario
 * @param code Código MFA ingresado por el usuario
 * @returns Respuesta indicando si el código es válido
 */
export const verifyMFACode = async (
  username: string, 
  code: string
): Promise<MFAVerifyResponse> => {
  try {
    console.log("Enviando petición de verificación MFA:", { username, token: code });
    
    // El endpoint espera 'token' no 'code'
    const response = await axios.post(`${BASE_URL}/api/verify`, {
      username,
      token: code // El API espera 'token' según la documentación
    });
    
    console.log("Respuesta de la API:", response.data);
    
    // La respuesta contiene 'status' con valor 'success' cuando la verificación es exitosa
    const status = response.data.status;
    
    return {
      success: status === "success", // La API devuelve "success" cuando el token es válido
      status: status
    };
  } catch (error: any) {
    console.error("Error al verificar código MFA:", error);
    
    // Información más detallada del error para debugging
    if (error.response) {
      console.error("Datos de la respuesta de error:", {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      });
    } else if (error.request) {
      console.error("No se recibió respuesta:", error.request);
    } else {
      console.error("Error al configurar la petición:", error.message);
    }
    
    // Manejar errores de validación (422)
    if (error.response?.status === 422) {
      return {
        success: false,
        message: "Error de validación: " + JSON.stringify(error.response.data.detail)
      };
    }
    
    // Otros errores
    return {
      success: false,
      message: error.message || "Error al verificar el código MFA"
    };
  }
};

/**
 * Para el modo de desarrollo, esta función simula la verificación
 * del código MFA durante la configuración inicial
 * @param username Nombre de usuario
 * @param code Código de verificación
 * @param secret Secreto TOTP generado (no se envía al backend, solo se usa localmente)
 * @returns Respuesta de verificación
 */
export const verifyMFASetup = async (
  username: string,
  code: string,
  secret: string // Este parámetro lo mantenemos para consistencia de la interfaz pero NO se envía
): Promise<MFAVerifyResponse> => {
  try {
    console.log("Verificando configuración MFA para:", username);
    
    // Usamos el mismo endpoint /api/verify solo con username y token
    const response = await axios.post(`${BASE_URL}/api/verify`, {
      username,
      token: code
      // No enviamos el secret, ya que el endpoint no lo requiere
    });
    
    console.log("Respuesta de verificación MFA:", response.data);
    
    return {
      success: response.data.status === "success",
      status: response.data.status
    };
  } catch (error: any) {
    console.error("Error al verificar configuración MFA:", error);
    
    // Información detallada del error
    if (error.response) {
      console.error("Detalles del error:", {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    // Para desarrollo, permitir un código de prueba
    if (process.env.NODE_ENV === 'development' && code === '654321') {
      console.log("Usando código de prueba para desarrollo");
      return {
        success: true,
        message: "MFA configurado correctamente (modo desarrollo)"
      };
    }
    
    return {
      success: false,
      message: error.message || "Error al verificar la configuración MFA"
    };
  }
};