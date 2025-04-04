'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { getApplications } from "@/lib/services/applicationService";

interface Column {
  accessor: string;
  header: string;
}

const ApplicationTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, any>[]>([]);

  // Definición actualizada de las columnas según el endpoint API
  const columns: Column[] = [
    { accessor: "name", header: "Nombre" },
    { accessor: "application_key", header: "Clave de Aplicación" },
    { accessor: "description", header: "Descripción" },
    { accessor: "version", header: "Versión" },
    { accessor: "is_active", header: "Estado" },
    { accessor: "created_at", header: "Fecha de Creación" },
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
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await getApplications(0, 100);
        
        const formattedApplications = response.map(app => {
          return {
            ...app,
            is_active: app.is_active ? "Habilitado" : "Deshabilitado",
            created_at: formatDate(app.created_at),
            description: app.description || "Sin descripción",
          };
        });
        
        setData(formattedApplications);
      } catch (err: any) {
        console.error("Error al cargar las aplicaciones:", err);
        setError("Error al cargar las aplicaciones. Por favor, intente de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filteredData = data.filter((row) =>
    columns.some((col) => {
      const value = row[col.accessor];
      return value !== undefined && value !== null && 
        String(value).toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

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
            placeholder="Buscar aplicaciones..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link href="/admin/apps/create">
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full m-2 text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Agregar aplicación
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
              </tr>
            ))
          ) : (
            <tr className="bg-white dark:bg-gray-800">
              <td colSpan={columns.length + 2} className="px-6 py-4 text-center">
                {searchTerm ? "No se encontraron resultados para la búsqueda" : "No hay aplicaciones disponibles"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationTable;