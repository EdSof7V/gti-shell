'use client'
import { HomepageApp } from "@/components/features/HomepageApp";
import { useSession } from "@/context/SessionContext";
import React from "react";



export default function HomePage() {
    const { session } = useSession();
  return (
    <>
      <div className="mb-10">
        <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Bienvenid@,</span> {session.username}.</h1>
        <p className="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">Accede a las diferentes aplicaciones de Gobierno de Tecnología de la Información (GTI) y gestiona tus procesos de manera eficiente.</p>
      </div>

      <div className="col-span-12 space-y-6 xl:col-span-7">
        <h2 className="text-4xl font-extrabold dark:text-white mt-10">Mis Aplicaciones</h2>
        <HomepageApp />
      </div>
    </>
  );
}
