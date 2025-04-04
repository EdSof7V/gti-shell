
import AddGroupForm from '@/components/features/group/AddGroupForm'
import React from 'react'
import PageBreadcrumb from '@/components/shared/common/PageBreadCrumb'
import ComponentCard from '@/components/shared/common/ComponentCard'

const CreateUserPage = () => {
  return (
    <div>
      <PageBreadcrumb pageTitle="Agregar grupo" />
      <div className="space-y-6">
        <ComponentCard title="Crear nuevo grupo">
            <AddGroupForm />
        </ComponentCard>
      </div>
    </div>
  )
}

export default CreateUserPage
