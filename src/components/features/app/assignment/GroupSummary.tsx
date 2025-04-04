import React from 'react';

type AppInfo = {
  id: string;
  key: string;
  name: string;
  emoji: string;
};

type SummaryItem = {
  grupo: string;
  apps: {
    app: string;
    count: number;
    total: number;
    percentage: number;
  }[];
  totalUsers: number;
};

interface GroupSummaryProps {
  summary: SummaryItem[];
  applications: AppInfo[];
}

const GroupSummary: React.FC<GroupSummaryProps> = ({ summary, applications }) => {
  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Resumen por Grupo</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Grupo
              </th>
              <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total
              </th>
              {applications.map(app => (
                <th key={app.id} scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {app.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {summary.map(item => (
              <tr key={item.grupo} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {item.grupo}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                  {item.totalUsers}
                </td>
                {item.apps.map(appData => (
                  <td key={`${item.grupo}-${appData.app}`} className="px-2 py-2 whitespace-nowrap text-sm text-center">
                    <div className="flex flex-col items-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {appData.count}/{appData.total}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${appData.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {appData.percentage}%
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupSummary;