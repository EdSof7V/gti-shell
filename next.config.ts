import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deshabilitar todos los indicadores de desarrollo
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  
  // Configurar el comportamiento de las entradas bajo demanda
  onDemandEntries: {
    // Periodo máximo de inactividad para una página (en milisegundos)
    maxInactiveAge: 25 * 1000,
    // Número de páginas a mantener en memoria
    pagesBufferLength: 2,
  },
  
  // Configuración de webpack existente para SVG + deshabilitación del overlay de errores
  webpack: (config, { dev, isServer }) => {
    // Mantener regla SVG existente
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    
    // Deshabilitar devtool en desarrollo para prevenir el overlay de errores
    if (dev && !isServer) {
      config.devtool = false;
    }
    
    return config;
  },
};

export default nextConfig;