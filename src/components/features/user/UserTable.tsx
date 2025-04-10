'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { getUsers, User } from "@/lib/services/userService";
// No necesitamos importar el modal

interface Column {
  accessor: string;
  header: string;
}

const UserTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, any>[]>([]);
  // Ya no necesitamos estados para el modal

  // Definición de las columnas exactamente como vienen del endpoint
  const columns: Column[] = [
    { accessor: "username", header: "Usuario" },
    { accessor: "email", header: "Email" },
    { accessor: "first_name", header: "Nombre" },
    { accessor: "last_name", header: "Apellido" },
    { accessor: "is_active", header: "Estado" },
    { accessor: "created_at", header: "Fecha de Creación" },
    { accessor: "last_login_date", header: "Último acceso" }
  ];

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
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
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers(0, 100);
        
        const formattedUsers = response.map(user => {
          return {
            ...user,
            is_active: user.is_active ? "Habilitado" : "Deshabilitado",
            created_at: formatDate(user.created_at),
            last_login_date: formatDate(user.last_login_date),
          };
        });
        
        setData(formattedUsers);
      } catch (err: any) {
        console.error("Error al cargar los usuarios:", err);
        setError("Error al cargar los usuarios. Por favor, intente de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredData = data.filter((row) =>
    columns.some((col) => {
      const value = row[col.accessor];
      return value !== undefined && value !== null && 
        String(value).toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  // Ya no necesitamos funciones para abrir/cerrar el modal

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
            placeholder="Buscar usuarios..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link href="/admin/users/create">
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full m-2 text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Agregar usuario
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
                {columns.map((col) => (
                  col.accessor === columns[0].accessor ? (
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
                            className={`h-2.5 w-2.5 rounded-full ${row[col.accessor] === "Habilitado"
                                ? "bg-green-500"
                                : "bg-red-500"
                              } me-2`}
                          ></div>
                          {row[col.accessor]}
                        </div>
                      ) : (
                        row[col.accessor]
                      )}
                    </td>
                  )
                ))}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Link href={`/admin/users/${row.id}/roles`}>
                      <button
                        type="button"
                        className="text-purple-700 border border-purple-700 hover:bg-purple-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:border-purple-500 dark:text-purple-500 dark:hover:text-white dark:focus:ring-purple-800 dark:hover:bg-purple-500"
                        title="Gestionar roles por aplicación"
                      >
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="sr-only">Gestionar aplicaciones del usuario</span>
                      </button>
                    </Link>

                    <Link href={`/admin/users/edit/${row.id}`}>
                      <button 
                        type="button" 
                        className="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500"
                      >
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="sr-only">Editar usuario</span>
                      </button>
                    </Link>
                    <Link href={`/admin/users/details/${row.id}`}>
                      <button 
                        type="button" 
                        className="text-green-700 border border-green-700 hover:bg-green-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:focus:ring-green-800 dark:hover:bg-green-500"
                      >
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="sr-only">Ver detalles</span>
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr className="bg-white dark:bg-gray-800">
              <td colSpan={columns.length + 2} className="px-6 py-4 text-center">
                {searchTerm ? "No se encontraron resultados para la búsqueda" : "No hay usuarios disponibles"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Ya no usamos el modal */}
    </div>
  );
};

export default UserTable;