"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Trash2, RefreshCw, File, Search } from "lucide-react"
import ReusableTable from "@/components/ReusableTable"
import FileUploader from "@/components/FileUploader"
import { useLanguage } from "@/context/LanguageContext"

interface FileData {
    id: string
    name: string
    status: "Processing!" | "Ready to Sync" | "Not Accepted" | "Ready"
    lastModified: string
    size: string
    isStaged?: boolean
    type?: string
}

const fileimportpage = () => {
    const [data, setData] = useState<FileData[]>([
        { id: "1", name: "Document 1", status: "Ready", lastModified: "2023-05-15", size: "1.2 MB" },
        { id: "2", name: "Document 2", status: "Not Accepted", lastModified: "2023-05-14", size: "2.5 MB" },
        { id: "3", name: "Document 3", status: "Processing!", lastModified: "2023-05-13", size: "0.8 MB" },
    ])

    const [syncStatuses, setSyncStatuses] = useState<
        Map<string, { status: "idle" | "pending" | "success" | "failure"; lastSync?: string }>
    >(new Map(data.map((file) => [file.id, { status: "idle" }])))

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [fileToDelete, setFileToDelete] = useState<FileData | null>(null)
    const { translations } = useLanguage();

    const allowedFileTypes = [".txt", ".pdf", ".doc", ".docx"]
    const maxFileSize = 10 * 1024 * 1024 // 10MB

    const syncFile = async (fileId: string) => {
        setSyncStatuses((prev) => new Map(prev).set(fileId, { status: "pending" }))
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            const success = Math.random() > 0.2
            if (success) {
                setSyncStatuses((prev) => new Map(prev).set(fileId, { status: "success", lastSync: new Date().toISOString() }))
            } else {
                throw new Error("Sync failed")
            }
        } catch (error) {
            setSyncStatuses((prev) => new Map(prev).set(fileId, { status: "failure" }))
        }
    }

    const confirmDelete = () => {
        if (fileToDelete) {
            setData((prev) => prev.filter((file) => file.id !== fileToDelete.id))
            setSyncStatuses((prev) => {
                const newMap = new Map(prev)
                newMap.delete(fileToDelete.id)
                return newMap
            })
            setShowDeleteModal(false)
            setFileToDelete(null)
        }
    }

    const cancelDelete = () => {
        setShowDeleteModal(false)
        setFileToDelete(null)
    }

    const handleUpload = async (files: File[]) => {
        const totalFiles = files.length
        let uploadedFiles = 0

        for (const file of files) {
            await new Promise<void>((resolve, reject) => {
                let progress = 0
                const interval = setInterval(() => {
                    progress += Math.random() * 10
                    if (progress >= 100) {
                        clearInterval(interval)
                        uploadedFiles++
                        resolve()
                    }
                }, 200)
                if (Math.random() < 0.1) {
                    clearInterval(interval)
                    reject(new Error(`Failed to upload ${file.name}`))
                }
            })
        }

        const newFiles: FileData[] = files.map((file, index) => ({
            id: `${Date.now()}-${index}`,
            name: file.name,
            status: "Ready to Sync",
            lastModified: new Date(file.lastModified).toISOString().split("T")[0],
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            type: file.type || "unknown",
        }))

        setData((prev) => [...prev, ...newFiles])
        setSyncStatuses((prev) => {
            const newMap = new Map(prev)
            newFiles.forEach((file) => newMap.set(file.id, { status: "idle" }))
            return newMap
        })
    }

    const fields = [
        {
            key: "name",
            label: translations?.code_file?.Name,
            sortable: false,
            render: (value: string, row: FileData) => (
                <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-gray-500" />
                    <span className={row.isStaged ? "italic text-gray-600" : ""}>{value}</span>
                </div>
            ),
        },
        {
            key: "status",
            label: translations?.code_file?.Status,
            sortable: false,
            render: (value: FileData["status"]) => {
                const statusStyles: Record<FileData["status"], string> = {
                    "Processing!": "text-blue-500",
                    "Ready to Sync": "text-gray-500",
                    "Not Accepted": "text-red-500",
                    Ready: "text-green-500",
                }
                return <span className={`font-medium ${statusStyles[value]}`}>{value}</span>
            },
        },
        { key: "lastModified", label: translations?.code_file?.Last_Modified, sortable: false },
        {
            key: "sync",
            label: translations?.code_file?.Sync,
            sortable: false,
            render: (_: any, row: FileData) => {
                if (row.isStaged) return null
                const status = syncStatuses.get(row.id) || { status: "idle" }
                return (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => syncFile(row.id)}
                        className="mx-auto flex"
                        disabled={status.status === "pending"}
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${status.status === "success" ? "text-[#EF6A37]" : status.status === "failure" ? "text-red-500" : ""} ${status.status === "pending" ? "animate-spin" : ""}`}
                        />
                    </Button>
                )
            },
        },
        { key: "size", label: translations?.code_file?.Size },
    ]

    const icons = [
        {
            key: "download",
            icon: <Download className="h-4 w-4" />,
            onClick: (row: FileData) => console.log(`Downloading ${row.name}`),
            condition: (row: FileData) => !row.isStaged, // Disable for staged files
        },
        {
            key: "view",
            icon: <img src="/Eye.svg" alt="View file" className="w-5 h-5" />,
            onClick: (row: FileData) => console.log(`Viewing ${row.name}`),
            condition: (row: FileData) => !row.isStaged,
        },
        {
            key: "send",
            icon: <img src="/send-3.svg" alt="Send file" className="w-5 h-5" />,
            onClick: (row: FileData) => console.log(`Sending ${row.name}`),
            condition: (row: FileData) => row.status === "Ready" && !row.isStaged,
        },
        {
            key: "delete",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (row: FileData) => {
                if (row.isStaged) {
                    setStagedFiles((prev) => prev.filter((file: { name: string }) => file.name !== row.name))
                } else {
                    setFileToDelete(row)
                    setShowDeleteModal(true)
                }
            },
        },
    ]

    const displayData = [...data]

    return (
        <div className="p-6 mx-auto">
            <h2 className="text-lg font-semibold mb-4">{translations?.ImportFile?.Upload_Files}</h2>
            <FileUploader
                allowedFileTypes={allowedFileTypes}
                maxFileSize={maxFileSize}
                onUpload={handleUpload}
            />
            <div className="bg-white rounded-lg shadow-sm">
                <div className="flex justify-between py-4 items-center px-6">
                    <h2 className="text-lg font-semibold">{translations?.ImportFile?.Already_Index_websites}</h2>
                    <div className="flex items-center space-x-3">
                        <div className="relative w-64">
                            <input
                                type="text"
                                placeholder={translations?.code_file?.Type_to_search}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                value={""}
                                onChange={(e) => console.log(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                            <img src="/filter-tick.svg" alt="Filter" className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                            <img src="/document-download.svg" alt="Download" className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
            <ReusableTable
                data={displayData}
                fields={fields}
                icons={icons}
                pageSize={5}
                selectable={true}
                onSelectionChange={(selectedIds) => console.log("Selected rows:", selectedIds)}
            />
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h3 className="text-lg font-semibold mb-4">Want to Delete Code File?</h3>
                        <p className="mb-6">
                            Are you sure you want to delete <span className="font-bold">{fileToDelete?.name}</span>? This action cannot be undone
                        </p>
                        <div className="flex justify-end space-x-4">
                            <Button variant="destructive" onClick={confirmDelete} className="bg-orange-500 hover:bg-orange-600">
                                Continue
                            </Button>
                            <Button variant="outline" onClick={cancelDelete} className="text-gray-700">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default fileimportpage

function setStagedFiles(arg0: (prev: any) => any) {
    throw new Error("Function not implemented.")
}
