
import AddApplicationForm from '@/components/features/app/AddApplicationForm'
import ComponentCard from '@/components/shared/common/ComponentCard'
import PageBreadcrumb from '@/components/shared/common/PageBreadCrumb'
import React from 'react'

const page = () => {
  return (
    <div>
      <PageBreadcrumb pageTitle="Aplicaciones" />
      <div className="space-y-6">
        <ComponentCard title="Crear nueva aplicación GTI">
          <AddApplicationForm />
        </ComponentCard>
      </div>
    </div>
  )
}

export default page
