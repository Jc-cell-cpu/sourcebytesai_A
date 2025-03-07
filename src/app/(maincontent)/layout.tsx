import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "SourceBytes.AI",
    description: "SourceBytes.AI",
};

export default function ContentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // <html lang="en">
        // <body
        //     className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        // >
        <div className="min-h-screen text-zinc-900 flex bg-zinc-800">
            <Sidebar />
            <div className="flex-1 h-[calc(100vh-25px)] overflow-hidden bg-white flex flex-col m-3 ml-0 pl-6 rounded-lg">
                <div className="overflow-y-scroll pr-8">
                    <Header />
                    {children}
                </div>
            </div>
            <Toaster />
        </div>

        // </body>
        // </html>
    );
}
