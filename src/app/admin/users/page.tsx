
import UserTable from "@/components/features/user/UserTable";
import ComponentCard from "@/components/shared/common/ComponentCard";
import PageBreadcrumb from "@/components/shared/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "GTI Users | Banco Ripley - GTI Dashboard Template",
  description:
    "Banco Ripley - GTI Dashboard",
};

export default function UsersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Usuarios" />
      <div className="space-y-6">
        <ComponentCard title="Usuarios GTI">
          <UserTable />
        </ComponentCard>
      </div>
    </div>
  );
}
