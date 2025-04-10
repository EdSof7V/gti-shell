
import AddGroupForm from '@/components/features/group/AddGroupForm'
import React from 'react'
import PageBreadcrumb from '@/components/shared/common/PageBreadCrumb'
import ComponentCard from '@/components/shared/common/ComponentCard'
import AddRoleForm from '@/components/features/roles/AddRoleForm'

const CreateUserPage = () => {
  return (
    <div>
      <PageBreadcrumb pageTitle="Agregar rol" />
      <div className="space-y-6">
        <ComponentCard title="Crear nuevo rol">
            <AddRoleForm />
        </ComponentCard>
      </div>
    </div>
  )
}

export default CreateUserPage
