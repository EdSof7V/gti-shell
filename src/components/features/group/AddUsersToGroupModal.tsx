"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../../ui/modal";
import { getUsers, User } from "@/lib/services/userService";
import { addUsersToGroups, GroupUserRelation } from "@/lib/services/groupService";

interface AddUsersToGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

const AddUsersToGroupModal: React.FC<AddUsersToGroupModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Cargar usuarios cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      // Reset state when modal opens
      setSelectedUsers([]);
      setSearchTerm("");
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedUsers = await getUsers(0, 100);
      setUsers(fetchedUsers);
    } catch (err: any) {
      console.error("Error al cargar usuarios:", err);
      setError("No se pudieron cargar los usuarios. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUsers.length === 0) {
      setError("Seleccione al menos un usuario para agregar al grupo.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);
      
      // Crear las relaciones de grupo-usuario
      const relations: GroupUserRelation[] = selectedUsers.map(userId => ({
        group_id: groupId,
        user_id: userId
      }));
      
      // Llamar al endpoint para agregar usuarios al grupo
      const result = await addUsersToGroups(relations);
      
      console.log("Usuarios agregados al grupo:", result);
      setSuccess(true);
      
      // Resetear la selección
      setSelectedUsers([]);
      
      // Cerrar el modal después de 1.5 segundos
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err: any) {
      console.error("Error al agregar usuarios al grupo:", err);
      setError(err.response?.data?.message || "Error al agregar usuarios al grupo. Inténtelo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrar usuarios por término de búsqueda
  const filteredUsers = users.filter(user => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower) ||
      user.first_name.toLowerCase().includes(searchTermLower) ||
      user.last_name.toLowerCase().includes(searchTermLower)
    );
  });

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
            Agregar usuarios a grupo: <span className="text-blue-600 dark:text-blue-400">{groupName}</span>
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
              <span className="font-medium">¡Éxito!</span> Los usuarios han sido agregados al grupo correctamente.
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="searchUsers" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Buscar usuarios</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  id="searchUsers"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ps-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Buscar usuarios por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <div className="overflow-hidden rounded-t-lg">
                {/* Tabla con cabecera fija y cuerpo desplazable */}
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="p-4 w-12">
                        <div className="flex items-center">
                          <input
                            id="checkbox-all"
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers(filteredUsers.map(user => user.id));
                              } else {
                                setSelectedUsers([]);
                              }
                            }}
                            checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                          />
                          <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 w-1/4">Usuario</th>
                      <th scope="col" className="px-6 py-3 w-1/4">Nombre</th>
                      <th scope="col" className="px-6 py-3 w-2/4">Email</th>
                    </tr>
                  </thead>
                </table>
              </div>
              
              <div className="overflow-y-auto max-h-60">
                {loading ? (
                  <div className="flex items-center justify-center h-60">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400 h-60 flex items-center justify-center">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </div>
                ) : (
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed">
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                          <td className="p-4 w-12">
                            <div className="flex items-center">
                              <input
                                id={`checkbox-${user.id}`}
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => handleUserSelection(user.id)}
                              />
                              <label htmlFor={`checkbox-${user.id}`} className="sr-only">checkbox</label>
                            </div>
                          </td>
                          <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white w-1/4">
                            {user.username}
                          </th>
                          <td className="px-6 py-4 w-1/4">
                            {user.first_name} {user.last_name}
                          </td>
                          <td className="px-6 py-4 w-2/4">
                            {user.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {selectedUsers.length} {selectedUsers.length === 1 ? 'usuario seleccionado' : 'usuarios seleccionados'}
            </p>
            
            {/* Modal footer */}
            <div className="flex items-center pt-4 border-t border-gray-200 rounded-b dark:border-gray-600">
              <button
                type="submit"
                disabled={submitting || selectedUsers.length === 0}
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
                  'Agregar Usuarios'
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

export default AddUsersToGroupModal;