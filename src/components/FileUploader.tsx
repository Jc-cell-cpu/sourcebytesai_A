"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Upload, File, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { useLanguage } from "@/context/LanguageContext"

interface FileUploaderProps {
    allowedFileTypes?: string[] // e.g., [".txt", ".pdf"]
    maxFileSize?: number // in bytes
    onUpload: (files: File[]) => Promise<void> // Callback to handle the upload logic
    initialFiles?: File[] // Optional pre-staged files
    maxFiles?: number // Optional max number of files
}

const FileUploader: React.FC<FileUploaderProps> = ({
    allowedFileTypes = [],
    maxFileSize = 10 * 1024 * 1024, // Default 10MB
    onUpload,
    initialFiles = [],
    maxFiles,
}) => {
    const [stagedFiles, setStagedFiles] = useState<File[]>(initialFiles)
    const [dragActive, setDragActive] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { translations } = useLanguage()

    // Validate file based on props
    const validateFile = useCallback(
        (file: File): { valid: boolean; reason?: string } => {
            if (file.size > maxFileSize) {
                return {
                    valid: false,
                    reason: `File size exceeds the maximum limit of ${(maxFileSize / (1024 * 1024)).toFixed(0)}MB`,
                }
            }
            if (allowedFileTypes.length > 0) {
                const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`
                if (!allowedFileTypes.includes(fileExtension)) {
                    return { valid: false, reason: `File type ${fileExtension} is not supported` }
                }
            }
            return { valid: true }
        },
        [allowedFileTypes, maxFileSize],
    )

    // Stage files with validation
    const stageFiles = useCallback(
        (files: File[]) => {
            setUploadError(null)
            const validFiles: File[] = []
            const invalidFiles: { file: File; reason: string }[] = []

            for (const file of files) {
                if (stagedFiles.some((f) => f.name === file.name)) {
                    invalidFiles.push({ file, reason: "File with the same name already exists" })
                    continue
                }
                const validation = validateFile(file)
                if (validation.valid) {
                    validFiles.push(file)
                } else {
                    invalidFiles.push({ file, reason: validation.reason || "Invalid file" })
                }
            }

            if (maxFiles && stagedFiles.length + validFiles.length > maxFiles) {
                toast({
                    title: translations?.toast?.Limit_exceeded,
                    description:
                        translations?.toast?.Limit_exceeded + `${maxFiles}` + translations?.toast?.Limit_description_files,
                    variant: "destructive",
                })
                return
            }

            if (invalidFiles.length > 0) {
                invalidFiles.forEach(({ file, reason }) => {
                    toast({
                        title: translations?.toast?.File_not_accepted,
                        description: `${file.name}: ${reason}`,
                        variant: "destructive",
                    })
                })
            }

            if (validFiles.length > 0) {
                setStagedFiles((prev) => [...prev, ...validFiles])
                toast({
                    title: translations?.toast?.Files_selected,
                    description: `${validFiles.length}` + translations?.toast?.file_ready_to_upload,
                    variant: "success",
                })
            }
        },
        [stagedFiles, validateFile, maxFiles],
    )

    // Drag and drop handlers
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            setDragActive(false)
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                stageFiles(Array.from(e.dataTransfer.files))
            }
        },
        [stageFiles],
    )

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                stageFiles(Array.from(e.target.files))
                e.target.value = ""
            }
        },
        [stageFiles],
    )

    const handleBrowseClick = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    // Handle upload
    const handleUpload = async () => {
        if (stagedFiles.length === 0) return
        setIsUploading(true)
        setUploadProgress(0)
        setUploadError(null)

        // Simulate initial progress
        const simulateProgress = () => {
            setUploadProgress((prev) => {
                // Only simulate up to 90% to leave room for the actual completion
                if (prev < 90) {
                    const increment = Math.random() * 10
                    return Math.min(prev + increment, 90)
                }
                return prev
            })
        }

        // Start progress simulation
        const progressInterval = setInterval(simulateProgress, 300)

        try {
            await onUpload(stagedFiles)
            setStagedFiles([])
            // Set to 100% when complete
            setUploadProgress(100)
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : "Upload failed")
            toast({
                title: "Upload failed",
                description: error instanceof Error ? error.message : "Failed to upload files",
                variant: "destructive",
            })
        } finally {
            // Clear the interval when done
            clearInterval(progressInterval)
            setIsUploading(false)
        }
    }

    const removeAllStagedFiles = () => {
        setStagedFiles([])
        toast({
            title: "Files cleared",
            description: "All staged files have been removed",
            variant: "default",
        })
    }

    return (
        <div className="bg-gray-100 p-6 rounded-lg max-w-xl">
            <h3 className="font-semibold mb-4">{translations?.code_file?.Select_File}</h3>

            {/* Drag and drop area */}
            <div
                className={cn(
                    "border-2 border-dashed rounded-md p-8 mb-4 bg-white text-center transition-colors duration-200",
                    dragActive ? "border-orange-500 bg-orange-50" : "border-gray-300 hover:border-gray-400",
                )}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
                role="button"
                tabIndex={0}
                aria-label="Drop files here or click to browse"
            >
                <input
                    type="file"
                    className="sr-only"
                    multiple
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    accept={allowedFileTypes.join(",")}
                    aria-label="File input"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-gray-700 font-medium">{translations?.code_file?.Drag_and_drop_files_here}</p>
                    <p className="text-gray-500 text-sm">{translations?.code_file?.or}</p>
                    <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleBrowseClick()
                        }}
                    >
                        {translations?.code_file?.Browse_Files}
                    </Button>
                </div>
            </div>

            {/* Staged files preview */}
            {stagedFiles.length > 0 && (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">
                            {translations?.code_file?.Select_File} ({stagedFiles.length})
                        </h4>
                        <Button variant="ghost" size="sm" onClick={removeAllStagedFiles} className="text-gray-500 h-8">
                            {translations?.code_file?.Clear_All}
                        </Button>
                    </div>
                    <div className="max-h-40 overflow-y-auto bg-white rounded-md border border-gray-200 p-2">
                        {stagedFiles.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-md"
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <File className="h-4 w-4 flex-shrink-0 text-gray-500" />
                                    <span className="text-sm truncate" title={file.name}>
                                        {file.name}
                                    </span>
                                    <span className="text-xs text-gray-500">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setStagedFiles((prev) => prev.filter((_, i) => i !== index))}
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload progress */}
            {isUploading && (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{translations?.code_file?.Uploading}</span>
                        <span className="text-sm">{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                </div>
            )}

            {/* Upload error */}
            {uploadError && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
            )}

            {/* Upload button */}
            <div className="flex justify-center">
                <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
                    onClick={handleUpload}
                    disabled={stagedFiles.length === 0 || isUploading}
                >
                    {isUploading ? translations?.code_file?.Uploading : translations?.code_file?.Upload}
                    <Upload className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}

export default FileUploader

