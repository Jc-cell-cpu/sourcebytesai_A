"use client"

import React from "react"
import { useState, useMemo, useId } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

interface FieldConfig {
    key: string
    label: string
    render?: (value: any, row: any) => React.ReactNode
    icon?: boolean
    sortable?: boolean
}

interface IconConfig {
    key: string
    icon: React.ReactNode
    onClick: (row: any) => void
    condition?: (row: any) => boolean
}

interface ReusableTableProps {
    data: any[]
    fields: FieldConfig[]
    icons?: IconConfig[]
    pageSize?: number
    selectable?: boolean
    onSelectionChange?: (selectedIds: string[]) => void
}

const ReusableTable: React.FC<ReusableTableProps> = ({
    data,
    fields,
    icons = [],
    pageSize = 10, // Default to 10 items per page
    selectable = true,
    onSelectionChange,
}) => {
    const tableId = useId()
    const [currentPage, setCurrentPage] = useState(1)
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)
    const [filterText, setFilterText] = useState("")
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [isClient, setIsClient] = useState(false)
    const { translations } = useLanguage()

    React.useEffect(() => {
        setIsClient(true)
    }, [])

    const filteredData = useMemo(() => {
        return data.filter((item) =>
            fields.some((field) => String(item[field.key]).toLowerCase().includes(filterText.toLowerCase()))
        )
    }, [data, fields, filterText])

    const sortedData = useMemo(() => {
        if (!sortConfig) return filteredData
        return [...filteredData].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1
            return 0
        })
    }, [filteredData, sortConfig])

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return sortedData.slice(startIndex, startIndex + pageSize)
    }, [sortedData, currentPage, pageSize])

    const totalPages = Math.ceil(sortedData.length / pageSize)

    const handleSort = (key: string) => {
        setSortConfig((prevConfig) =>
            prevConfig && prevConfig.key === key
                ? { key, direction: prevConfig.direction === "asc" ? "desc" : "asc" }
                : { key, direction: "asc" }
        )
    }

    const handleSelectAll = (checked: boolean) => {
        const newSelectedRows = checked ? paginatedData.map((row) => row.id) : []
        setSelectedRows(newSelectedRows)
        onSelectionChange?.(newSelectedRows)
    }

    const handleSelectRow = (id: string, checked: boolean) => {
        const newSelectedRows = checked ? [...selectedRows, id] : selectedRows.filter((rowId) => rowId !== id)
        setSelectedRows(newSelectedRows)
        onSelectionChange?.(newSelectedRows)
    }

    const renderCell = (field: FieldConfig, row: any) => {
        if (!isClient && field.render) {
            return row[field.key] || ""
        }
        return field.render ? field.render(row[field.key], row) : row[field.key]
    }

    return (
        <div className="rounded-md border">
            <Table className="bg-[#F5F5F5] p-2">
                <TableHeader className="m-2">
                    <TableRow>
                        {selectable && (
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={isClient && selectedRows.length === paginatedData.length && paginatedData.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                        )}
                        {fields.map((field) => (
                            <TableHead
                                key={`${tableId}-header-${field.key}`}
                                className="font-extrabold text-black text-center"
                            >
                                <div className="flex items-center justify-center">
                                    {field.label}
                                    {field.sortable && (
                                        <Button variant="ghost" size="sm" className="ml-2" onClick={() => handleSort(field.key)}>
                                            <ArrowUpDown className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </TableHead>
                        ))}
                        {icons.length > 0 && <TableHead className="font-extrabold text-black text-center">{translations?.code_file?.Action}</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody className="m-2">
                    {paginatedData.map((row) => (
                        <TableRow key={`${tableId}-row-${row.id}`} className="m-2">
                            {selectable && (
                                <TableCell className="bg-white">
                                    <Checkbox
                                        checked={isClient && selectedRows.includes(row.id)}
                                        onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
                                    />
                                </TableCell>
                            )}
                            {fields.map((field) => (
                                <TableCell
                                    key={`${tableId}-cell-${row.id}-${field.key}`}
                                    className="bg-white text-center"
                                >
                                    {renderCell(field, row)}
                                </TableCell>
                            ))}
                            {icons.length > 0 && (
                                <TableCell className="bg-white text-center">
                                    {isClient && (
                                        <div className="flex justify-center space-x-2">
                                            {icons.map(
                                                (iconConfig) =>
                                                    iconConfig.condition?.(row) !== false && (
                                                        <Button
                                                            key={`${tableId}-action-${row.id}-${iconConfig.key}`}
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => iconConfig.onClick(row)}
                                                        >
                                                            {iconConfig.icon}
                                                        </Button>
                                                    )
                                            )}
                                        </div>
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="p-4 flex items-center justify-between bg-white rounded-b-lg">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{translations?.reusable_table?.Show}</span>
                    <select
                        className="border rounded p-1 text-sm text-orange-500"
                        value={pageSize}
                        onChange={(e) => setCurrentPage(1)} // Reset to page 1, but pageSize is fixed at 10
                    >
                        <option value={10}>10</option> {/* Only show 10 as an option since it's fixed */}
                    </select>
                    <span className="text-sm text-gray-500">{translations?.reusable_table?.entries}</span>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="link"
                        size="icon"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-500" />
                    </Button>
                    <span className="text-sm text-gray-500">{translations?.reusable_table?.Page} {currentPage} {translations?.reusable_table?.of} {totalPages}</span>
                    <Button
                        variant="link"
                        size="icon"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ReusableTable