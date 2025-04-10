"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import EditRoleForm from '@/components/features/roles/EditRoleForm';

export default function EditRolePage() {
  const params = useParams();
  const roleId = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <EditRoleForm roleId={roleId} />
    </div>
  );
}