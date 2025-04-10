"use client";
import React, { useState, useEffect } from "react";
import AppCard from "./app/AppCard";
import { getUserApplications } from '../../lib/services/applicationService';
import { useSession } from "@/context/SessionContext";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  sub?: string;
  [key: string]: any;
}
export const HomepageApp = () => {
  // Estado para almacenar las aplicaciones del usuario
  const [userApps, setUserApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para generar una URL de imagen basada en el nombre de la aplicación
  const getImageUrlForApp = (appName) => {
    const name = appName.toLowerCase();

    // Puedes expandir esta lógica según tus necesidades
    if (name.includes('dashboard')) {
      return "https://plecto-website-2020.s3.amazonaws.com/images/widgets.2e16d0ba.fill-1200x625.format-jpeg.jpg";
    } else if (name.includes('dc') || name.includes('process')) {
      return "https://projectmanagers.net/wp-content/uploads/2023/01/project-management-software-blog-1024x578.jpeg";
    } else if (name.includes('user') || name.includes('gti')) {
      return "https://www.conytec.com/wp-content/uploads/2021/04/updating@2x_w.png";
    } else if (name.includes('gobierno') || name.includes('tecnología')) {
      return "https://softjourn.com/media/ArticlesMN/finopsarticle/graphics-for-finops-article/fin-ops-article-image-03.png";
    }

    // Imagen predeterminada
    return "https://www.conytec.com/wp-content/uploads/2021/04/updating@2x_w.png";
  };

  const { session } = useSession();

  const decodedToken: DecodedToken | null = session?.accessToken
    ? safelyDecodeToken(session.accessToken)
    : null;

  const userId = decodedToken?.sub || null;

  function safelyDecodeToken(token: string): DecodedToken | null {
    try {
      return jwtDecode(token) as DecodedToken;
    } catch (error) {
      return null;
    }
  }
  const getShortNameForApp = (appName) => {
    const specificMappings = {
      "Dashboard Manager": "DM",
      "crm Wordpres": "CRM",
      "user_manager": "UM",
      "application_process_manager": "APM",
      "Gobierno de Tecnología de Información": "GTI",
      "Data Catalog": "DC"
    };

    // Si hay un mapeo específico, úsalo
    if (specificMappings[appName]) {
      return specificMappings[appName];
    }

    // De lo contrario, genera uno automáticamente
    if (appName.includes(' ')) {
      // Toma las iniciales de cada palabra
      return appName.split(' ')
        .map(word => word.charAt(0))
        .join('');
    }

    if (appName.includes('_')) {
      // Para nombres con guiones bajos
      return appName.split('_')
        .map(word => word.charAt(0))
        .join('');
    }

    // Para nombres de una sola palabra, toma las primeras 2-3 letras
    return appName.substring(0, Math.min(3, appName.length)).toUpperCase();
  };



  useEffect(() => {
    // Función para obtener las aplicaciones del usuario
    const fetchUserApps = async () => {
      try {
        const data = await getUserApplications(userId);
        setUserApps(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserApps();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Cargando aplicaciones...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  // Filtrar solo aplicaciones activas
  const activeApps = userApps.filter(app => app.is_active);

  return (
    <div className="mt-10">
      {/* Grid de aplicaciones */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6">
        {activeApps.length > 0 ? (
          activeApps.map(app => (
            <AppCard
              key={app.id}
              title={app.name}
              shortName={getShortNameForApp(app.name)}
              description={app.description}
              imageUrl={getImageUrlForApp(app.name)}
              link={app.url || "#"}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            No tienes acceso a ninguna aplicación. Contacta a tu administrador.
          </div>
        )}
      </div>
    </div>
  );
};