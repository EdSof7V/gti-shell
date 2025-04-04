"use client";
import React from "react";
import AppCard from "./app/AppCard";

export const HomepageApp = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6 mt-10">
      <AppCard
        title="Application Platform Management"
        shortName="APM"
        description="Monitorea el estado y rendimiento de todos los sistemas en un solo lugar."
        imageUrl="https://projectmanagers.net/wp-content/uploads/2023/01/project-management-software-blog-1024x578.jpeg"
        link="#"
      />
      <AppCard
        title="Dashboard Manager"
        shortName="DM"
        description="Plataforma para visualizar y gestionar dashboards en tiempo real."
        imageUrl="https://plecto-website-2020.s3.amazonaws.com/images/widgets.2e16d0ba.fill-1200x625.format-jpeg.jpg"
        link="https://br-gcp-dv-frt-nextjs--jd-br-gcp-gob-ti-dev.us-central1.hosted.app/"
      />
      <AppCard
        title="Obsolecencia de Software"
        shortName="OS"
        description="Identifica tecnologías desactualizadas y gestiona su renovación."
        imageUrl="https://www.conytec.com/wp-content/uploads/2021/04/updating@2x_w.png"
        link="#"
      />
      <AppCard
        title="FinOps"
        shortName="FO"
        description="Optimiza costos en la nube con análisis y control financiero."
        imageUrl="https://softjourn.com/media/ArticlesMN/finopsarticle/graphics-for-finops-article/fin-ops-article-image-03.png"
        link="#"
      />

    </div>
  );
};
