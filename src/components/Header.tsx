"use client"

import React from 'react'
import { Bell } from "lucide-react";
import { MdOutlineContactSupport } from "react-icons/md";
import { TbUserSquare } from "react-icons/tb";
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';

export const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { translations } = useLanguage();

    // Function to determine the header title and icon based on the current route
    const getHeaderContent = () => {
        switch (pathname) {
            case '/dashboard':
                return {
                    title: translations?.header?.text_1 || 'Powering Enterprise Innovation with Gen-AI',
                    icon: null
                };
            case '/datasource':
                return {
                    title: translations?.header?.text_2 || 'Add Connector',
                    icon: '/cloudchange.svg'
                };
            case '/accounts':
                return {
                    title: translations?.header?.text_1 || 'Admin Accounts',
                    icon: null
                };
            case '/settings':
                return {
                    title: translations?.header?.text_1 || 'Settings',
                    icon: null
                };
            case '/web':
                return {
                    title: translations?.header?.text_3 || 'Web',
                    icon: '/web.svg'
                };
            case '/ImportFile':
                return {
                    title: translations?.header?.text_4 || 'Import File',
                    icon: '/Vector.svg'
                };
            case '/ImportGdrive':
                return {
                    title: translations?.header?.text_5 || 'Google Drive',
                    icon: '/Group1.svg'
                };
            case '/ImportCodeFile':
                return {
                    title: translations?.header?.text_6 || 'Import Source or Project File',
                    icon: '/Vector.svg'
                };

            default:
                return {
                    title: translations?.header?.text_1 || 'Powering Enterprise Innovation with Gen-AI',
                    icon: null
                };
        }
    };

    const { title, icon } = getHeaderContent();

    return (
        <header className="p-4 pl-0 flex items-center justify-between border-b border-zinc-200">
            <div className="flex items-center gap-3">
                {icon && (
                    <Image
                        src={icon}
                        alt={`${title} icon`}
                        width={20}
                        height={20}
                        className="w-5 h-5"
                    />
                )}
                <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 border-[1.5px] hover:bg-zinc-100 transition-colors">
                    <Bell className="w-5 h-5 text-zinc-700" />
                </button>
                <button className="p-2 border-[1.5px] hover:bg-zinc-100 transition-colors">
                    <MdOutlineContactSupport
                        className="w-5 h-5 text-zinc-700"
                        onClick={() => { window.open("https://sourcebytes.ai/", "_blank", "noopener,noreferrer"); }}
                    />
                </button>
                <button className="p-2 border-[1.5px] hover:bg-zinc-100 transition-colors">
                    <TbUserSquare
                        className="w-5 h-5 text-zinc-700"
                        onClick={() => { router.push('/settings') }}
                    />
                </button>
            </div>
        </header>
    )
}