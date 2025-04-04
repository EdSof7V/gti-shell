
import AppAssignment from '@/components/features/app/AppAssignment'
import ApplicationTable from '@/components/features/app/ApplicationTable'
import ComponentCard from '@/components/shared/common/ComponentCard'
import PageBreadcrumb from '@/components/shared/common/PageBreadCrumb'
import React from 'react'

const page = () => {
  return (
    <div>
      <PageBreadcrumb pageTitle="Aplicaciones" />
      <div className="space-y-6">
        <ComponentCard title="Aplicaciones GTI">
          <ApplicationTable />
        </ComponentCard>
      </div>
    </div>
  )
}

export default page
