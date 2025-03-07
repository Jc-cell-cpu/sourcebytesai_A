"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getOrganisationList } from "@/components/apicalls/organisation"
import { createAdmin } from "@/components/apicalls/admin-acount"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

interface AddAdminModalProps {
    isOpen: boolean
    onClose: () => void
}

interface AdminFormData {
    name: string
    tenant_id: string
    password: string
    email: string
    cpassword: string
}

const initialFormData: AdminFormData = {
    name: "",
    tenant_id: "",
    password: "",
    email: "",
    cpassword: ""
}

export function AddAdminModal({ isOpen, onClose }: AddAdminModalProps) {
    const [formData, setFormData] = useState<AdminFormData>(initialFormData)
    const [listings, setListings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isLoading, setIsLoading] = useState(false) // Added loading state for form submission
    const { translations } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true) // Set loading state to true when submission starts
        try {
            const authDetails = JSON.parse(sessionStorage.getItem("authDetails") || "{}")
            const token = authDetails?.data?.token
            const { cpassword, ...formDataWithoutCpassword } = formData
            const response = await createAdmin(token, formDataWithoutCpassword)

            if (response.success) {
                setFormData(initialFormData)
                onClose()
            }
        } catch (error) {
            console.error("Error creating admin:", error)
        } finally {
            setIsLoading(false) // Reset loading state when done
        }
    }

    const loadOrganisations = async () => {
        setLoading(true)
        try {
            const authDetails = JSON.parse(sessionStorage.getItem("authDetails") || "{}")
            const token = authDetails?.data?.token

            if (!token) {
                console.error("No auth token found")
                return
            }

            const fetchedListings = await getOrganisationList(token)
            setListings(fetchedListings.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadOrganisations()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{translations?.super_admin?.add_admin}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid w-full gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="tenant_id">{translations?.super_admin?.select_organization} *</Label>
                            <Select
                                value={formData.tenant_id}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, tenant_id: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={translations?.super_admin?.select_organization} />
                                </SelectTrigger>
                                <SelectContent>
                                    {listings && listings.map((org: any) => (
                                        <SelectItem key={org?.id} value={org.tenant_id}>{org.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">{translations?.super_admin?.admin_name}*</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">{translations?.super_admin?.admin_email}*</Label>
                            <Input
                                id="email"
                                autoComplete=""
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">{translations?.super_admin?.create_password}</Label>
                            <Input
                                type="password"
                                autoComplete="off"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cpassword">{translations?.super_admin?.confirm_password}</Label>
                            <Input
                                type="password"
                                autoComplete="off"
                                id="cpassword"
                                name="cpassword"
                                value={formData.cpassword}
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
                                {translations?.super_admin?.adding_admin}
                            </>
                        ) : (
                            translations?.super_admin?.add_admin
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}