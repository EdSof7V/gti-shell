"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import EditRoleForm from '@/components/features/roles/EditRoleForm';
import EditApplicationForm from '@/components/features/app/EditApplicationForm';

export default function EditRolePage() {
  const params = useParams();
  const applicationId = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <EditApplicationForm applicationId={applicationId} />
    </div>
  );
}