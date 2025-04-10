"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../../ui/modal";
import { 
  getPermissions, 
  getRolePermissions, 
  assignPermissionsToRole,
  Permission,
  PermissionAssignment
} from "@/lib/services/roleService";

interface AssignRolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: string;
  roleName: string;
}

const AssignRolePermissionsModal: React.FC<AssignRolePermissionsModalProps> = ({
  isOpen,
  onClose,
  roleId,
  roleName,
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Cargar permisos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchPermissionsData();
      // Reset state when modal opens
      setSearchTerm("");
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, roleId]);

  const fetchPermissionsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener todos los permisos del sistema
      const allPermissions = await getPermissions(0, 500);
      
      // Obtener los permisos asignados al rol
      const rolePermissions = await getRolePermissions(roleId);
      
      // Guardar todos los permisos para mostrarlos
      setPermissions(allPermissions);
      
      // Establecer los permisos seleccionados (los que ya tiene el rol)
      setSelectedPermissions(rolePermissions.map(permission => permission.id));
      
    } catch (err: any) {
      console.error("Error al cargar permisos:", err);
      setError("No se pudieron cargar los permisos. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionSelection = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);
      
      // Preparar los datos de asignación
      const assignments: PermissionAssignment[] = selectedPermissions.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId
      }));
      
      // Enviar la asignación al backend
      await assignPermissionsToRole(assignments);
      
      setSuccess(true);
      
      // Cerrar el modal después de 1.5 segundos
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err: any) {
      console.error("Error al asignar permisos al rol:", err);
      setError(err.response?.data?.message || "Error al asignar permisos al rol. Inténtelo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrar permisos por término de búsqueda
  const filteredPermissions = permissions.filter(permission => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      permission.name.toLowerCase().includes(searchTermLower) ||
      permission.description?.toLowerCase().includes(searchTermLower) ||
      permission.code.toLowerCase().includes(searchTermLower)
    );
  });

  // Agrupar permisos por su código para mejor organización
  const groupedPermissions = filteredPermissions.reduce((groups, permission) => {
    // Extraer el prefijo del código (ej: "app:users" -> "app")
    const prefix = permission.code.split(':')[0] || 'otros';
    
    if (!groups[prefix]) {
      groups[prefix] = [];
    }
    
    groups[prefix].push(permission);
    return groups;
  }, {} as Record<string, Permission[]>);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-auto max-w-xl md:w-2/3 lg:w-1/2"
    >
      <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Asignar permisos al rol: <span className="text-blue-600 dark:text-blue-400">{roleName}</span>
          </h3>
          <button 
            type="button" 
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={onClose}
          >
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span className="sr-only">Cerrar modal</span>
          </button>
        </div>
        
        {/* Modal body */}
        <div className="p-4 md:p-5">
          {error && (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 dark:text-red-400" role="alert">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}
          
          {success && (
            <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-green-900/20 dark:text-green-400" role="alert">
              <span className="font-medium">¡Éxito!</span> Los permisos han sido asignados al rol correctamente.
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="searchPermissions" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Buscar permisos</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  id="searchPermissions"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ps-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Buscar permisos por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Contenedor de permisos */}
            <div className="mb-4 border border-gray-200 rounded-lg dark:border-gray-700">
              {loading ? (
                <div className="flex items-center justify-center h-60">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : Object.keys(groupedPermissions).length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 h-60 flex items-center justify-center">
                  No se encontraron permisos que coincidan con la búsqueda.
                </div>
              ) : (
                <div className="overflow-y-auto max-h-96">
                  {Object.entries(groupedPermissions).map(([prefix, perms]) => (
                    <div key={prefix} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <h4 className="p-3 bg-gray-50 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-300">
                        {prefix.toUpperCase()}
                      </h4>
                      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {perms.map(permission => (
                          <div key={permission.id} className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id={`permission-${permission.id}`}
                                type="checkbox"
                                checked={selectedPermissions.includes(permission.id)}
                                onChange={() => handlePermissionSelection(permission.id)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor={`permission-${permission.id}`} className="font-medium text-gray-900 dark:text-white cursor-pointer">
                                {permission.name}
                              </label>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{permission.code}</p>
                              {permission.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{permission.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mb-4">
              {/* Contador de permisos seleccionados */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedPermissions.length} {selectedPermissions.length === 1 ? 'permiso seleccionado' : 'permisos seleccionados'}
              </p>
              
              {/* Opciones de selección rápida */}
              <div className="flex space-x-2">
                <button 
                  type="button"
                  onClick={() => setSelectedPermissions(permissions.map(p => p.id))}
                  className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400"
                >
                  Seleccionar todos
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedPermissions([])}
                  className="text-xs px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                  Limpiar
                </button>
              </div>
            </div>
            
            {/* Modal footer */}
            <div className="flex items-center pt-4 border-t border-gray-200 rounded-b dark:border-gray-600">
              <button
                type="submit"
                disabled={submitting}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  'Guardar permisos'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default AssignRolePermissionsModal;