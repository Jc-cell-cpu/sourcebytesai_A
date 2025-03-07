"use client"

import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { CheckCircle, Search, XCircle } from 'lucide-react'
import { Action } from '@/components/Action'
import { TbFilterCheck } from "react-icons/tb";
import { PiFileArrowDownDuotone } from "react-icons/pi";
import { RiFileUploadLine } from "react-icons/ri";
import { useRouter } from 'next/navigation'
import { deleteFile, getFileList } from '@/components/apicalls/tenant-file'
import { AddDocumentModal } from './add-document-modal'
import { useToast } from "@/hooks/use-toast"
import Loader from '@/components/Loader'
import { useLanguage } from '@/context/LanguageContext'



interface Document {
    id: string
    file_name: string
}

const DocumentPage = () => {
    const [entries, setEntries] = useState<number>(10)
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState<any[]>([]);
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<Document | null>(null);
    const { toast } = useToast()
    const { translations } = useLanguage();

    const loadListings = async () => {
        setLoading(true);
        try {
            const authDetails = JSON.parse(sessionStorage.getItem("authDetails") || "{}");
            const token = authDetails?.data?.token;
            const tenant_id = authDetails?.data?.tenant_id;
            if (!token) {
                console.error("No auth token found");
                toast({
                    variant: "destructive", title: (
                        <div className="flex items-start gap-2">
                            <XCircle className="h-11 w-9 text-white" />
                            <div className="flex flex-col">
                                <span className="font-semibold text-base">Error</span>
                                <span className="text-sm font-light">No auth token found.</span>
                            </div>
                        </div>
                    ) as unknown as string, duration: 5000
                });
                return;
            }

            const fetchedListings = await getFileList(token, tenant_id);

            setListings(fetchedListings.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (doc: Document) => {
        setSelectedFile(selectedFile?.id === doc.id ? null : doc); // Toggle selection
    };

    const handleDelete = async () => {
        if (!selectedFile) {
            toast({
                variant: "destructive", title: (
                    <div className="flex items-start gap-2">
                        <XCircle className="h-11 w-9 text-white" />
                        <div className="flex flex-col">
                            <span className="font-semibold text-base">Error</span>
                            <span className="text-sm font-light">No file selected!</span>
                        </div>
                    </div>
                ) as unknown as string, duration: 5000
            });
            return;
        }
        const authDetails = JSON.parse(sessionStorage.getItem("authDetails") || "{}");
        const token = authDetails?.data?.token;
        const tenant_id = authDetails?.data?.tenant_id;

        const res = await deleteFile(token, tenant_id, selectedFile.id);
        if (res.success) {
            loadListings()
            // setListings((prev) => prev.filter((file) => file.id !== selectedFile.id));
            toast({
                variant: "success", title: (
                    <div className="flex items-start gap-2">
                        <CheckCircle className="h-11 w-9 text-white" />
                        <div className="flex flex-col">
                            <span className="font-semibold text-base">Deleted</span>
                            <span className="text-sm font-light"><span className='text-sm font-bold'>{selectedFile.file_name}</span> has been removed.</span>
                        </div>
                    </div>
                ) as unknown as string, duration: 5000
            });
            setSelectedFile(null);
        }
        else {
            toast({
                variant: "destructive", title: (
                    <div className="flex items-start gap-2">
                        <XCircle className="h-11 w-9 text-white" />
                        <div className="flex flex-col">
                            <span className="font-semibold text-base">Something went wrong</span>
                            <span className="text-sm font-light"><span className='text-sm font-bold'>{selectedFile.file_name}</span> has not been removed.</span>
                        </div>
                    </div>
                ) as unknown as string, duration: 5000
            });
        }
    };


    useEffect(() => {
        loadListings();
    }, []); // Empty dependency array ensures it runs only once when the component mounts.



    return (
        <>
            <div className="p-4 md:p-6 max-w-[2000px] mx-auto">
                <div className="flex justify-end mb-3">
                    <Button className="bg-orange-500 hover:bg-orange-600 flex items-center" onClick={() => setIsModalOpen(true)}>
                        <RiFileUploadLine className="h-4 w-4" />
                        {translations?.admin?.upload}
                    </Button>
                    <AddDocumentModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false)
                            loadListings()
                        }}
                        onSubmit={(data) => {
                            // Handle the new organization data here
                        }}
                    />
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder={translations?.admin?.type_search}
                                    className="pl-10 w-full"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <TbFilterCheck className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" />
                                <PiFileArrowDownDuotone className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <input type="checkbox" className="rounded border-gray-300" />
                                        </TableHead>
                                        <TableHead className="min-w-[300px]">{translations?.admin?.name}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {listings && listings.map((doc: any) => (
                                        <TableRow key={doc.id}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFile?.id === doc.id}
                                                    onChange={() => handleCheckboxChange(doc)}
                                                    className="rounded border-gray-300" />
                                            </TableCell>
                                            <TableCell className="flex items-center gap-2">
                                                <svg className="h-5 w-5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2H6C4.89543 2 4 2.89543 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <span className="truncate">{doc.file_name}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
                                <div className="flex items-center gap-2 w-96">
                                    <span className="text-sm text-gray-500">{translations?.admin?.show}</span>
                                    <select
                                        value={entries}
                                        onChange={(e) => setEntries(Number(e.target.value))}
                                        className="border rounded p-1 text-sm"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                    <span className="text-sm text-gray-500">{translations?.admin?.entries}</span>
                                </div>

                                <Pagination>
                                    <PaginationContent className="flex gap-2">
                                        <PaginationItem>
                                            <PaginationPrevious href="#" />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationLink href="#" isActive>
                                                1
                                            </PaginationLink>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationNext href="#" />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </div>
                    </div>
                    <div className="lg:min-w-[240px]">
                        <Action selectedFile={selectedFile} onDelete={handleDelete} />
                    </div>
                </div>
            </div>


            {loading && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <Loader size="lg" className="text-white" />
                </div>
            )}
        </>
    );
}

export default DocumentPage