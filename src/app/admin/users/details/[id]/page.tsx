"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import UserDetails from '@/components/features/user/UserDetails';

export default function DetailsUserPage() {
  const params = useParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <UserDetails userId={userId} />
    </div>
  );
}