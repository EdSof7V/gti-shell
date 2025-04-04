
import AddUsersToGroupModal from '@/components/features/group/AddUsersToGroupModal';
import GroupTable from '@/components/features/group/GroupTable';
import ComponentCard from '@/components/shared/common/ComponentCard';
import PageBreadcrumb from '@/components/shared/common/PageBreadCrumb';
import FormInModal from '@/components/shared/ModalExample/FormInModal';
import React from 'react'


const GroupsPage = () => {
  return (
    <div>
      <PageBreadcrumb pageTitle="Grupos" />
      <div className="space-y-6">
        <ComponentCard title="Grupos GTI">
          <GroupTable/>
        </ComponentCard>
      </div>
    </div>
  )
}

export default GroupsPage
