import { Suspense } from "react"
import EditOrganizationForm from "./edit-organization-form"

export default function EditOrganizationPage() {
  return (
    <Suspense fallback={<div className="container mx-auto">Loading...</div>}>
      <EditOrganizationForm />
    </Suspense>
  )
}

