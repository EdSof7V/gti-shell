
import StepperAddUser from '@/components/features/user/StepperAddUser'
import ComponentCard from '@/components/shared/common/ComponentCard'
import PageBreadcrumb from '@/components/shared/common/PageBreadCrumb'
import React from 'react'

const CreateUserPage = () => {
  return (
    <div>
      <PageBreadcrumb pageTitle="Agregar usuario" />
      <div className="space-y-6">
        <ComponentCard title="Crear nuevo usuario">
          <StepperAddUser />
        </ComponentCard>
      </div>
    </div>
  )
}

export default CreateUserPage
