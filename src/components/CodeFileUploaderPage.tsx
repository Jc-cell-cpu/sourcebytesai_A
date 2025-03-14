"use client"

import React from "react"
import FileUploader from "@/components/FileUploader"
import { useLanguage } from "@/context/LanguageContext"
import { uploadCodeFile } from "@/components/apicalls/importcodefiles"
import { useToast } from "@/hooks/use-toast"

interface FileData {
    id: string
    name: string
    status: string
    lastModified: string
    size: string
    code_file?: string
    isStaged?: boolean
    type?: string
}

interface CodeFileUploaderPageProps {
    onUploadSuccess: () => void // Updated to not require uploadedFiles
}

const CodeFileUploaderPage: React.FC<CodeFileUploaderPageProps> = ({ onUploadSuccess }) => {
    const codeFileTypes = [
        ".js", ".ts", ".py", ".cpp", ".java", ".css", ".html", ".c",
        ".cs", ".php", ".rb", ".swift", ".kt", ".go", ".rs", ".m",
        ".sh", ".bat", ".ps1", ".sql", ".xml", ".json", ".yml", ".yaml",
        ".md", ".jsx", ".tsx", ".vue", ".scss", ".sass", ".less",
        ".h", ".hpp", ".vb", ".pl", ".r", ".scala", ".dart", ".groovy",
        ".asm", ".mjs", ".coffee", ".erl", ".ex", ".lua", ".f90", ".for",
        ".tcl", ".pas", ".ada", ".vhd", ".verilog", ".pug", ".haml", ".zip"
    ];
    const maxFileSize = 30 * 1024 * 1024 // 30MB for code files
    const { translations } = useLanguage()
    const { toast } = useToast()

    const handleCodeUpload = async (files: File[]) => {
        const authDetailsString = sessionStorage.getItem("authDetails")
        if (!authDetailsString) {
            toast({
                title: "Error",
                description: "Authentication details missing",
                variant: "destructive",
            })
            throw new Error("Authentication details missing")
        }

        let authDetails
        try {
            authDetails = JSON.parse(authDetailsString)
        } catch (e) {
            toast({
                title: "Error",
                description: "Failed to parse authentication details",
                variant: "destructive",
            })
            throw new Error("Failed to parse authentication details")
        }

        const token = authDetails.data?.token
        const tenant_id = authDetails.data?.tenant_id

        if (!token || !tenant_id) {
            toast({
                title: "Error",
                description: "Token or tenant_id missing",
                variant: "destructive",
            })
            throw new Error("Token or tenant_id missing")
        }

        let hasSuccess = false
        for (const file of files) {
            const response = await uploadCodeFile(token, tenant_id, file)
            console.log(`Upload response for ${file.name}:`, response)

            if (response.success) {
                hasSuccess = true
                toast({
                    title: "Success",
                    description: `File ${file.name} uploaded successfully`,
                    variant: "success"
                })
            } else {
                toast({
                    title: "Upload Failed",
                    description: `Failed to upload ${file.name}: ${response.error}`,
                    variant: "destructive",
                })
            }
        }

        if (hasSuccess) {
            onUploadSuccess() // Call without arguments to trigger refetch
        }
    }

    return (
        <div className="p-6 mx-auto">
            <h2 className="text-lg font-semibold mb-4">{translations?.code_file?.Upload_Code_Files}</h2>
            <FileUploader
                allowedFileTypes={codeFileTypes}
                maxFileSize={maxFileSize}
                onUpload={handleCodeUpload}
                maxFiles={10}
            />
        </div>
    )
}

export default CodeFileUploaderPage