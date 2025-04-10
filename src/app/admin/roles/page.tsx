
import RoleTable from "@/components/features/roles/RoleTable";
import UserTable from "@/components/features/user/UserTable";
import ComponentCard from "@/components/shared/common/ComponentCard";
import PageBreadcrumb from "@/components/shared/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "GTI Roles | Banco Ripley - GTI Dashboard Template",
  description:
    "Banco Ripley - GTI Dashboard",
};

export default function UsersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Roles" />
      <div className="space-y-6">
        <ComponentCard title="Roles GTI">
          <RoleTable />
        </ComponentCard>
      </div>
    </div>
  );
}
