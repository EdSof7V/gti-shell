
import AppAssignment from '@/components/features/app/AppAssignment'
import ComponentCard from '@/components/shared/common/ComponentCard'
import PageBreadcrumb from '@/components/shared/common/PageBreadCrumb'
import React from 'react'

const page = () => {
  return (
    <div>
      <PageBreadcrumb pageTitle="Asignación de Aplicaciones" />
      <div className="space-y-6">
        <ComponentCard title="Asignar aplicaciones GTI a grupos de usuarios">
          <AppAssignment />
        </ComponentCard>
      </div>
    </div>
  )
}

export default page
