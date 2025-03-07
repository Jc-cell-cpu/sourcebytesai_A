"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, RefreshCw, Search } from "lucide-react"
import ReusableTable from "@/components/ReusableTable"
import { useLanguage } from "@/context/LanguageContext"

interface FileData {
    id: string
    name: string
    status: "Processing!" | "Ready to Sync" | "Not Accepted" | "Ready"
    lastModified: string
}

const importfromGdrivepage = () => {
    const [data, setData] = useState<FileData[]>([
        { id: "1", name: "https://apps.apple.com/in/app/niai/id159019033", status: "Processing!", lastModified: "03:00:54 11-03-2024" },
        { id: "2", name: "https://apps.apple.com/in/app/niai/id159019033", status: "Ready to Sync", lastModified: "03:00:54 11-03-2024" },
        { id: "3", name: "https://apps.apple.com/in/app/niai/id159019033", status: "Not Accepted", lastModified: "03:00:54 11-03-2024" },
        { id: "4", name: "https://apps.apple.com/in/app/niai/id159019033", status: "Ready", lastModified: "03:00:54 11-03-2024" },
    ]);

    // Track sync status for each file
    const [syncStatuses, setSyncStatuses] = useState<
        Map<string, { status: "idle" | "pending" | "success" | "failure"; lastSync?: string }>
    >(new Map(data.map((file) => [file.id, { status: "idle" }])))

    // Modal state for delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [fileToDelete, setFileToDelete] = useState<FileData | null>(null)
    const { translations } = useLanguage();

    // Simulated async API call for sync
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

    // Handle delete confirmation
    const confirmDelete = () => {
        if (fileToDelete && data) { // Add null check for data
            console.log(`Deleting ${fileToDelete.name}`)
            setData((prev) => prev.filter((file) => file.id !== fileToDelete.id) || []) // Ensure prev is not undefined
            setSyncStatuses((prev) => {
                const newMap = new Map(prev)
                newMap.delete(fileToDelete.id)
                return newMap
            })
            setShowDeleteModal(false)
            setFileToDelete(null)
        }
    }

    // Cancel delete
    const cancelDelete = () => {
        setShowDeleteModal(false)
        setFileToDelete(null)
    }

    const fields = [
        { key: "name", label: translations?.web?.Base_URL, sortable: false },
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
        {
            key: "lastModified",
            label: translations?.web?.Last_Sync,
            sortable: false,
            render: (value: string) => value,
        },
        {
            key: "sync",
            label: translations?.web?.Sync_Now,
            sortable: false,
            render: (_: any, row: FileData) => {
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
        // { key: "action", label: "Action", sortable: false, render: () => null }, // Placeholder for Action column
    ]

    const icons = [
        {
            key: "delete",
            icon: <Trash2 className="h-4 w-4 text-gray-500" />,
            onClick: (row: FileData) => {
                setFileToDelete(row)
                setShowDeleteModal(true)
            },
        },
    ]

    const handleSelectionChange = (selectedIds: string[]) => {
        console.log("Selected rows:", selectedIds)
    }

    return (
        <div className="p-6 mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{translations?.Gdrive?.Add_Google_Drive_Link}</h2>
            <div className="bg-gray-100 p-6 rounded-lg mb-6 max-w-xl shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">{translations?.Gdrive?.Add_Link}</h3>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="indosakuradev@gmail.com"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
                <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white text-center py-2 rounded-md flex items-center justify-center gap-2"
                    onClick={() => console.log("Connect clicked")}
                >
                    {translations?.web?.Connect}
                    {/* <img src="/document-upload.svg" alt="Connect icon" className="h-5 w-5" /> */}
                </Button>
            </div>

            {/* <h2 className="text-2xl font-bold mb-6 text-gray-800">Already Index websites:</h2> */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="flex justify-between py-4 items-center px-6">
                    <h2 className="text-lg font-semibold">{translations?.web?.Already_Index_websites}</h2>
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
                <ReusableTable
                    data={data}
                    fields={fields}
                    icons={icons}
                    pageSize={5}
                    selectable={true}
                    onSelectionChange={handleSelectionChange}
                />
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h3 className="text-lg font-semibold mb-4">Want to Delete Code File?</h3>
                        <p className="mb-6">
                            Are you sure you want to delete? This action
                            cannot be undone
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

export default importfromGdrivepage