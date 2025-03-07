"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { uploadFile } from "@/components/apicalls/tenant-file"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
// import { createOrganisation } from "./apicalls/organisation"

interface AddDocumentModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: string) => void
}



export function AddDocumentModal({ isOpen, onClose }: AddDocumentModalProps) {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false)
    const { toast } = useToast()


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;

        setFile(selectedFile);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!file) {
            toast({
                variant: "destructive", title: (
                    <div className="flex items-start gap-2">
                        <XCircle className="h-11 w-9 text-white" />
                        <div className="flex flex-col">
                            <span className="font-semibold text-base">Error</span>
                            <span className="text-sm font-light">No file selected</span>
                        </div>
                    </div>
                ) as unknown as string, duration: 5000
            });
            return;
        }
        setIsUploading(true)
        const formData = new FormData();
        formData.append('file', file);



        try {
            const authDetails = JSON.parse(sessionStorage.getItem("authDetails") || "{}")
            const token = authDetails?.data?.token
            const tenant_id = authDetails?.data?.tenant_id

            const response = await uploadFile(token, formData, tenant_id)

            if (response.success) {
                toast({
                    variant: "success", title: (
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-11 w-9 text-white" />
                            <div className="flex flex-col">
                                <span className="font-semibold text-base">Uploaded</span>
                                <span className="text-sm font-light">File Upload Successfully.</span>
                            </div>
                        </div>
                    ) as unknown as string, duration: 5000
                });
                onClose()
            } else {
                // Handle error
                console.error("Upload failed:", response.message)
                toast({
                    variant: "destructive", title: (
                        <div className="flex items-start gap-2">
                            <XCircle className="h-11 w-9 text-white" />
                            <div className="flex flex-col">
                                <span className="font-semibold text-base">Error</span>
                                <span className="text-sm font-light">Upload failed. Please try again.</span>
                            </div>
                        </div>
                    ) as unknown as string, duration: 5000
                });
            }
        } catch (error) {
            console.error("Upload error:", error)
            toast({
                variant: "destructive", title: (
                    <div className="flex items-start gap-2">
                        <XCircle className="h-11 w-9 text-white" />
                        <div className="flex flex-col">
                            <span className="font-semibold text-base">Error</span>
                            <span className="text-sm font-light">An error occurred during upload. Please try again.</span>
                        </div>
                    </div>
                ) as unknown as string, duration: 5000
            });
        } finally {
            setIsUploading(false)
        }

    }



    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Document</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid w-full gap-4">
                        <div className="grid gap-2">
                            {/* <label htmlFor="file" className="block text-sm font-bold text-gray-700 mb-2">
                                Category Image
                            </label> */}
                            <Input
                                id="file"
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf"
                                disabled={isUploading}
                            />
                        </div>
                        {/* <div className="grid gap-2">
                            <Label htmlFor="name">Admin Name*</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email*</Label>
                            <Input id="email" autoComplete="" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Create Password</Label>
                            <Input type="password" autoComplete="off" id="password" name="password" value={formData.password} onChange={handleChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cpassword">Confirm Password</Label>
                            <Input type="password" autoComplete="off" id="cpassword" name="cpassword" value={formData.cpassword} onChange={handleChange} />
                        </div> */}
                    </div>
                    <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600"
                        disabled={isUploading || !file}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            "Add Document"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

