"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import UserUpdateForm from '@/components/features/user/UserUpdateForm';

export default function EditUserPage() {
  const params = useParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <UserUpdateForm userId={userId} />
    </div>
  );
}