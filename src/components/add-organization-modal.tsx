"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createOrganisation } from "./apicalls/organisation"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

interface AddOrganizationModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: OrganizationFormData) => void
}

interface OrganizationFormData {
    name: string
    contact_email: string
    account_manager_name: string
    account_manager_email: string
    subscription_type: string
    address: string
    phone_number: string
}

const initialFormData: OrganizationFormData = {
    name: "",
    contact_email: "",
    account_manager_name: "",
    account_manager_email: "",
    subscription_type: "",
    address: "",
    phone_number: "",
}

export function AddOrganizationModal({ isOpen, onClose }: AddOrganizationModalProps) {
    const [formData, setFormData] = useState<OrganizationFormData>(initialFormData)
    const [isLoading, setIsLoading] = useState(false) // Added loading state
    const { translations } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true) // Set loading to true when submission starts
        try {
            const authDetails = JSON.parse(sessionStorage.getItem("authDetails") || "{}")
            const token = authDetails?.data?.token
            const response = await createOrganisation(token, formData)
            onClose()
        } catch (error) {
            console.error("Error creating organization:", error)
        } finally {
            setIsLoading(false) // Reset loading state when done
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{translations?.super_admin?.add_organization}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid w-full gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">{translations?.super_admin?.organization_name}*</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contact_email">{translations?.super_admin?.email}*</Label>
                            <Input id="contact_email" name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="account_manager_name">{translations?.super_admin?.account_manager_name}*</Label>
                            <Input
                                id="account_manager_name"
                                name="account_manager_name"
                                value={formData.account_manager_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="account_manager_email">{translations?.super_admin?.account_manager_email}*</Label>
                            <Input
                                id="account_manager_email"
                                name="account_manager_email"
                                type="email"
                                value={formData.account_manager_email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="subscriptionType">{translations?.super_admin?.subscription_type}</Label>
                            <Select
                                value={formData.subscription_type}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, subscription_type: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={translations?.super_admin?.selected_sub_type} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Free Trial">{translations?.super_admin?.free_trial}</SelectItem>
                                    <SelectItem value="Professional">{translations?.super_admin?.professional}</SelectItem>
                                    {/* <SelectItem value="enterprise">Enterprise</SelectItem> */}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">{translations?.super_admin?.organization_address}</Label>
                            <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone_number">{translations?.super_admin?.phone_number}</Label>
                            <Input
                                id="phone_number"
                                name="phone_number"
                                type="tel"
                                value={formData.phone_number}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        disabled={isLoading} // Disable button while loading
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                {translations?.super_admin?.adding_organization}
                            </>
                        ) : (
                            translations?.super_admin?.add_organization
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}