'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { getGroups, Group } from "@/lib/services/groupService";
import AddUsersToGroupModal from "./AddUsersToGroupModal";

interface Column {
  accessor: string;
  header: string;
}

const GroupTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);

  // Definición de las columnas para la tabla
  const columns: Column[] = [
    { accessor: "name", header: "Nombre" },
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
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await getGroups(0, 100);
        
        // Transformar los datos para que coincidan con el formato esperado por la tabla
        const formattedGroups = response.map(group => {
          return {
            ...group,
            is_active: group.is_active ? "Activo" : "Deshabilitado",
            created_at: formatDate(group.created_at),
            updated_at: formatDate(group.updated_at || group.created_at),
            // Valores por defecto para campos que podrían faltar en la respuesta de la API
            created_by: group.created_by || "Sistema",
            updated_by: group.updated_by || "Sistema",
            description: group.description || "Sin descripción"
          };
        });
        
        setData(formattedGroups);
      } catch (err: any) {
        console.error("Error al cargar los grupos:", err);
        setError("Error al cargar los grupos. Por favor, intente de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const filteredData = data.filter((row) =>
    columns.some((col) =>
      String(row[col.accessor]).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleOpenModal = (groupId: string, groupName: string) => {
    setSelectedGroup({ id: groupId, name: groupName });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
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
            placeholder="Buscar grupos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link href="/admin/groups/create">
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full m-2 text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Agregar grupo
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
                            className={`h-2.5 w-2.5 rounded-full ${row[col.accessor] === "Activo"
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
                    <button
                      type="button"
                      onClick={() => handleOpenModal(row.id, row.name)}
                      className="text-green-700 border border-green-700 hover:bg-green-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:focus:ring-green-800 dark:hover:bg-green-500"
                      title="Agregar usuarios al grupo"
                    >
                      <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span className="sr-only">Agregar usuarios al grupo</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr className="bg-white dark:bg-gray-800">
              <td colSpan={columns.length + 2} className="px-6 py-4 text-center">
                {searchTerm ? "No se encontraron resultados para la búsqueda" : "No hay grupos disponibles"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Modal para agregar usuarios al grupo */}
      {selectedGroup && (
        <AddUsersToGroupModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
        />
      )}
    </div>
  );
};

export default GroupTable;