'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { getRoles } from "@/lib/services/roleService";
import AssignRolePermissionsModal from "./AssignRolePermissionModal";

interface Column {
  accessor: string;
  header: string;
}

const RoleTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<{ id: string; name: string } | null>(null);

  // Definición de las columnas para la tabla - Agregando la columna role_code
  const columns: Column[] = [
    { accessor: "name", header: "Nombre" },
    { accessor: "role_code", header: "Código" }, // Nueva columna
    { accessor: "description", header: "Descripción" },
    { accessor: "is_active", header: "Estado" },
    { accessor: "created_at", header: "Fecha de Creación" },
    { accessor: "created_by", header: "Creado por" },
    { accessor: "updated_at", header: "Fecha de Actualización" },
    { accessor: "updated_by", header: "Actualizado por" }
  ];

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      // Formatear la fecha manualmente (DD/MM/YYYY HH:MM)
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error("Error al formatear la fecha:", error);
      return dateString || 'N/A';
    }
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const response = await getRoles(0, 100);
        
        // Transformar los datos para que coincidan con el formato esperado por la tabla
        const formattedRoles = response.map(role => {
          return {
            ...role,
            is_active: role.is_active ? "Activo" : "Deshabilitado",
            created_at: formatDate(role.created_at),
            updated_at: formatDate(role.updated_at || role.created_at),
            // Valores por defecto para campos que podrían faltar en la respuesta de la API
            created_by: role.created_by || "Sistema",
            updated_by: role.updated_by || "Sistema",
            description: role.description || "Sin descripción",
            // Asegurarse de que el campo role_code siempre tenga un valor
            role_code: role.role_code || "N/A"
          };
        });
        
        setData(formattedRoles);
      } catch (err: any) {
        console.error("Error al cargar los roles:", err);
        setError("Error al cargar los roles. Por favor, intente de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const filteredData = data.filter((row) =>
    columns.some((col) =>
      String(row[col.accessor]).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleOpenModal = (roleId: string, roleName: string) => {
    setSelectedRole({ id: roleId, name: roleName });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <div className="flex justify-between items-center pb-4 bg-white dark:bg-gray-900">
        <div className="relative mt-1 ms-4">
          <label htmlFor="table-search" className="sr-only">Buscar</label>
          <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input 
            type="text" 
            id="table-search" 
            className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            placeholder="Buscar roles..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link href="/admin/roles/create">
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full m-2 text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Agregar rol
          </button>
        </Link>
      </div>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="p-4">
              <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded" />
            </th>
            {columns.map((col) => (
              <th key={col.accessor} scope="col" className="px-6 py-3">
                {col.header}
              </th>
            ))}
            <th scope="col" className="px-6 py-3">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td className="p-4 w-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                  />
                </td>
                {columns.map((col, colIndex) => (
                  colIndex === 0 ? (
                    <th
                      key={col.accessor}
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {row[col.accessor]}
                    </th>
                  ) : (
                    <td key={col.accessor} className="px-6 py-4">
                      {col.accessor === "is_active" ? (
                        <div className="flex items-center">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${row[col.accessor] === "Activo"
                                ? "bg-green-500"
                                : "bg-red-500"
                              } me-2`}
                          ></div>
                          {row[col.accessor]}
                        </div>
                      ) : col.accessor === "role_code" ? (
                        // Mostrar el código del rol con un estilo distintivo
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                          {row[col.accessor]}
                        </span>
                      ) : (
                        row[col.accessor]
                      )}
                    </td>
                  )
                ))}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                   {/*  <button
                      type="button"
                      onClick={() => handleOpenModal(row.id, row.name)}
                      className="text-green-700 border border-green-700 hover:bg-green-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:focus:ring-green-800 dark:hover:bg-green-500"
                      title="Asignar permisos al rol"
                    >
                      <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="sr-only">Asignar permisos al rol</span>
                    </button> */}
                    
                    <Link href={`/admin/roles/edit/${row.id}`}>
                      <button
                        type="button"
                        className="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500"
                        title="Editar rol"
                      >
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span className="sr-only">Editar rol</span>
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr className="bg-white dark:bg-gray-800">
              <td colSpan={columns.length + 2} className="px-6 py-4 text-center">
                {searchTerm ? "No se encontraron resultados para la búsqueda" : "No hay roles disponibles"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Modal para asignar permisos al rol */}
      {selectedRole && (
        <AssignRolePermissionsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          roleId={selectedRole.id}
          roleName={selectedRole.name}
        />
      )}
    </div>
  );
};

export default RoleTable;