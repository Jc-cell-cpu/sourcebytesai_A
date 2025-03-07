"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TbFilterCheck } from "react-icons/tb";
import { PiFileArrowDownDuotone } from "react-icons/pi";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { RiFileUploadLine } from "react-icons/ri";
import { AddOrganizationModal } from "@/components/add-organization-modal";
import { useRouter } from "next/navigation";
import { getAdminList } from "@/components/apicalls/admin-acount";
import { AddAdminModal } from "./add-admin-modal";
import Loader from "@/components/Loader"; // Import the Loader component
import { useLanguage } from "@/context/LanguageContext";

interface Organization {
    id: string;
    name: string;
    email: string;
    subscriptionType: string;
    accountManager: string;
    status: "Active" | "Inactive";
    address?: string;
}

const Accounts = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState("10");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const { translations } = useLanguage();

    const loadListings = async () => {
        setLoading(true); // Start loading
        try {
            const authDetails = JSON.parse(sessionStorage.getItem("authDetails") || "{}");
            const token = authDetails?.data?.token;

            if (!token) {
                console.error("No auth token found");
                return;
            }

            const fetchedListings = await getAdminList(token);
            setListings(fetchedListings.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    useEffect(() => {
        loadListings();
    }, []); // Empty dependency array ensures it runs only once when the component mounts.

    return (
        <>
            <div className="container mx-auto py-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{translations?.super_admin?.all_admins}</h1>
                    </div>
                    <div>
                        <Button
                            className="bg-orange-500 hover:bg-orange-600 flex items-center"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <RiFileUploadLine className="h-4 w-4" />
                            {translations?.super_admin?.add_admin}
                        </Button>
                        <AddAdminModal
                            isOpen={isModalOpen}
                            onClose={() => {
                                loadListings(); // Refresh the list after closing the modal
                                setIsModalOpen(false);
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
                    <div className="relative w-full sm:w-[250px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder={translations?.admin?.type_search}
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                            <TbFilterCheck className="h-8 w-8 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <PiFileArrowDownDuotone className="h-8 w-8 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" />
                        </Button>
                    </div>
                </div>

                <div className="rounded-md border">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-200">
                                    <TableHead>{translations?.super_admin?.admin_name}</TableHead>
                                    <TableHead>{translations?.super_admin?.admin_email}</TableHead>
                                    <TableHead>{translations?.super_admin?.organization}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {listings &&
                                    listings.map((org: any) => (
                                        <TableRow key={org.admin_email} className="cursor-pointer hover:bg-gray-200/50">
                                            <TableCell className="font-medium">{org.admin_name}</TableCell>
                                            <TableCell>{org.admin_email}</TableCell>
                                            <TableCell>{org.organization}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">{translations?.admin?.show}</span>
                        <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                            <SelectTrigger className="w-[70px]">
                                <SelectValue>{entriesPerPage}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm">{translations?.admin?.entries}</span>
                    </div>
                    <div className="flex items-center gap-2">
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

            {/* Loader Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <Loader size="lg" className="text-white" />
                </div>
            )}
        </>
    );
};

export default Accounts;