

import GridShape from "@/components/shared/common/GridShape";
import ThemeTogglerTwo from "@/components/shared/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-[#8C4799] dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center  flex z-1">
              <GridShape />
              <div className="flex flex-col items-center">
                <h1 className="mb-4 text-2xl text-center font-extrabold leading-none tracking-tight text-white md:text-5xl lg:text-6xl dark:text-white">Gobierno de Tecnología de Información <span className="text-blue-600 dark:text-blue-500">(GTI)</span></h1>
                <p className="text-center text-gray-400 dark:text-white/60">
                  Bienvenido al portal de Gobierno de Tecnología de Información, un espacio centralizado donde encontrarás diversas aplicaciones diseñadas para optimizar la gestión y supervisión de la tecnología en nuestra organización.
                </p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
