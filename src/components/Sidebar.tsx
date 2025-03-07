'use client'
import { useEffect, useState } from 'react';
import { Layout, FileText, Settings, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Card } from './ui/card';
import { TbLayoutSidebarFilled } from "react-icons/tb";
import { usePathname, useRouter } from "next/navigation"
import { useLanguage } from '@/context/LanguageContext';

export const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [role, setRole] = useState<string | null>(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { translations } = useLanguage();

    useEffect(() => {
        const fetchRole = async () => {
            const userRole = JSON.parse(sessionStorage.getItem('authDetails') as string).data.user_type
            setRole(userRole);
        };

        fetchRole();
    }, []);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = () => {
        sessionStorage.removeItem('authDetails');
        setShowLogoutModal(false);
        router.push('/');
    };

    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
    };

    const menuItems = [
        { icon: Layout, label: translations?.sidebar?.dashboard, href: '/dashboard' },
        ...(role === 'superuser'
            ? [{ icon: FileText, label: translations?.sidebar?.add_admin_accounts, href: '/accounts' }]
            // : [{ icon: FileText, label: translations?.sidebar?.documents, href: '/documents' }]),
            : [{ icon: FileText, label: translations?.sidebar?.data_source, href: '/datasource' }]),
        { icon: Settings, label: translations?.sidebar?.settings, href: '/settings' },
    ];

    return (
        <>
            <aside
                className={cn(
                    'h-screen bg-zinc-800 text-white left-0 top-0 z-50 flex flex-col transition-all duration-300 ease-in-out',
                    isExpanded ? 'w-80' : 'w-20'
                )}
            >
                <div className={`flex items-center justify-between ${isExpanded ? 'p-4' : 'py-4 px-2'}`}>
                    <div className={cn('flex items-center', isExpanded ? 'gap-3' : 'gap-0')}>
                        <Image
                            src="/SYEEKBYET LOGO bg 1.svg"
                            alt="SourceBytes.AI Logo"
                            width={20}
                            height={20}
                            className="w-[25px] h-[25px]"
                        />
                        <span className={cn('font-semibold text-xl whitespace-nowrap transition-all duration-300 ease-in-out',
                            isExpanded ? 'block' : 'hidden'
                        )}>
                            {translations?.app_name}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 rounded-lg text-lg hover:bg-white/10 transition-all duration-300 ease-in-out"
                    >
                        <TbLayoutSidebarFilled className='h-5 w-5 pointer-events-auto' />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <a
                            key={item.href}
                            onClick={() => { router.push(item.href) }}
                            className={`flex ${pathname == item.href ? 'bg-white/25 font-extrabold' : ''} cursor-pointer items-center text-lg gap-3 ${isExpanded ? 'p-3' : 'py-3 justify-center'} rounded-lg hover:bg-white/10 transition-all duration-300 ease-in-out`}
                        >
                            <item.icon className={`w-5 h-5 ${pathname == item.href ? 'text-[#EF6A37]' : ''}`} />
                            <span className={cn('whitespace-nowrap transition-all duration-300 ease-in-out',
                                isExpanded ? 'block' : 'hidden'
                            )}>
                                {item.label}
                            </span>
                        </a>
                    ))}
                </nav>
                <div className="px-4 mb-4">
                    <Card className={cn('relative overflow-hidden bg-gradient-to-b from-[#eb9471] to-[#d05524] text-white p-6 border-none',
                        isExpanded ? 'opacity-100' : 'opacity-0 w-0'
                    )}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full transform translate-x-8 -translate-y-8" />
                        <div className="absolute bottom-0 right-12 w-16 h-16 bg-white/10 rounded-full" />
                        <Image
                            src="/SYEEKBYET bgwhite.svg"
                            alt="SourceBytes.AI Logo"
                            width={30}
                            height={30}
                            className="w-[30px] h-[30px] mb-4"
                        />
                        <h3 className="text-lg font-semibold mb-2">{translations?.app_name}</h3>
                        <p className="text-md leading-tight opacity-90">{translations?.sidebar?.box_text_1}</p>
                    </Card>
                </div>

                <div className="p-3 border-t border-white/10">
                    <button onClick={handleLogoutClick}
                        className={cn('flex items-center w-full p-3 text-xl rounded-lg hover:bg-white/10 text-left transition-all duration-300 ease-in-out',
                            isExpanded ? 'gap-3' : 'gap-0'
                        )}>
                        <LogOut className="w-5 h-5" />
                        <span className={cn('whitespace-nowrap transition-all duration-300 ease-in-out',
                            isExpanded ? 'opacity-100' : 'opacity-0 w-0'
                        )}>
                            {translations?.sidebar?.logout}
                        </span>
                    </button>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-96 relative">
                        <button
                            onClick={handleLogoutCancel}
                            className="absolute top-2 right-2 p-1 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-semibold text-black mb-4">{translations?.sidebar?.logout_message_h2}</h2>
                        <p className="text-gray-600 mb-6">{translations?.sidebar?.logout_message_p}</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={handleLogoutConfirm}
                                className="px-4 py-2 bg-[#EF6A37] text-white rounded hover:bg-orange-400 transition-colors"
                            >
                                {translations?.sidebar?.logout}
                            </button>

                            <button
                                onClick={handleLogoutCancel}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                {translations?.sidebar?.cancel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};