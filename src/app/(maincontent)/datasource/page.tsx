"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function DataSourcePage() {
    const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(true);
    const [isSourceCodeOpen, setIsSourceCodeOpen] = useState(true);
    const router = useRouter();
    const { translations } = useLanguage();

    // State to track which item is currently clicked/actively pressed
    const [activeItem, setActiveItem] = useState(null);

    const handleNavigation = (path: string) => {
        router.push(path); // Navigate to the specified path
    };

    return (
        <div className="p-5 font-sans">
            <div className="mb-8">
                <button
                    className="flex items-center mb-3 text-gray-800 text-xl font-semibold focus:outline-none"
                    onClick={() => setIsKnowledgeOpen(!isKnowledgeOpen)}
                >
                    {/* Knowledge Management */}
                    {translations?.data_source?.title1}
                    <ChevronDown
                        className={`w-5 h-5 ml-2 transition-transform duration-200 ${isKnowledgeOpen ? "rotate-180" : ""}`}
                    />
                </button>

                {isKnowledgeOpen && (
                    <div className="flex gap-8 p-6 w-fit">
                        {/* Import Knowledge Section */}
                        <div className="flex-1 bg-gray-100 rounded-xl p-6 flex flex-col items-center">
                            <h2 className="text-xl font-semibold mb-6">{translations?.data_source?.sub_title1}</h2>
                            <div className="flex gap-5">
                                {[
                                    { label: translations?.data_source?.text1, icon: "Group.svg", path: "/web" },
                                    { label: translations?.data_source?.text2, icon: "Vector.svg", path: "/ImportFile" },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className={`bg-white rounded-lg p-6 text-center w-[120px] h-[120px] shadow-sm flex flex-col justify-center items-center cursor-pointer transition-colors ${activeItem === item.label ? "bg-blue-100 border border-blue-300" : "hover:bg-blue-50"
                                            }`}
                                        onClick={() => handleNavigation(item.path)}
                                    >
                                        <img
                                            src={`/${item.icon}`}
                                            alt={item.label}
                                            className="w-[40px] mb-2"
                                        />
                                        <p className="text-sm font-medium">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Setup Auto-Syncing Section */}
                        <div className="flex-1 bg-gray-100 rounded-xl p-6 w-fit flex flex-col items-center">
                            <h2 className="text-xl font-semibold mb-6 whitespace-nowrap">
                                {/* Setup Auto-Syncing from Apps */}
                                {translations?.data_source?.title2}
                            </h2>
                            <div
                                className={`bg-white rounded-lg p-6 text-center w-[120px] h-[120px] shadow-sm flex flex-col justify-center items-center cursor-pointer transition-colors ${activeItem === "Google Drive" ? "bg-blue-100 border border-blue-300" : "hover:bg-blue-50"
                                    }`}
                                onClick={() => handleNavigation("/ImportGdrive")}
                                onMouseLeave={() => setActiveItem(null)}
                            >
                                <img src="/Group1.svg" alt="Google Drive" className="w-[40px] mb-2" />
                                <p className="text-sm font-medium">{translations?.data_source?.text3}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div>
                <button
                    className="flex items-center mb-3 text-gray-800 text-xl font-semibold focus:outline-none"
                    onClick={() => setIsSourceCodeOpen(!isSourceCodeOpen)}
                >
                    {translations?.data_source?.title2}
                    <ChevronDown
                        className={`w-5 h-5 ml-2 transition-transform duration-200 ${isSourceCodeOpen ? "rotate-180" : ""}`}
                    />
                </button>

                {isSourceCodeOpen && (
                    <div className="flex p-6 w-fit">
                        <div className="bg-gray-100 rounded-xl p-6 w-fit flex flex-col items-center">
                            <h2 className="text-lg font-semibold mb-4">{translations?.data_source?.sub_title3}</h2>
                            <div className="flex items-center gap-4">
                                <div
                                    className={`bg-white rounded-lg p-6 text-center w-[120px] h-[120px] shadow-sm flex flex-col justify-center items-center cursor-pointer transition-colors ${activeItem === "Code File" ? "bg-blue-100 border border-blue-300" : "hover:bg-blue-50"
                                        }`}
                                    onClick={() => handleNavigation("/ImportCodeFile")}
                                    onMouseLeave={() => setActiveItem(null)}
                                >
                                    <div className="w-10 h-10 mb-2 flex items-center justify-center">
                                        <img src="/Group2.svg" alt="Code File" className="w-8 h-8" />
                                    </div>
                                    <p className="text-sm font-medium">{translations?.data_source?.text4}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}