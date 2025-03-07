"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "./login";
import Loader from "@/components/Loader";
import { ArrowLeft, ArrowRight, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

export default function LandingPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [showOtp, setShowOtp] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility
    const router = useRouter();
    const { toast } = useToast()
    const { translations } = useLanguage();

    const handleSubmit = async () => {
        if (!showOtp) {
            if (email && email.includes("@")) {
                setShowOtp(true);
            } else {
                toast({
                    variant: "destructive", title: (
                        <div className="flex items-start gap-2">
                            <XCircle className="h-11 w-9 text-white" />
                            <div className="flex flex-col">
                                <span className="font-semibold text-base">Error</span>
                                <span className="text-sm font-light">Please enter a valid email address</span>
                            </div>
                        </div>
                    ) as unknown as string, duration: 5000
                });
            }
        } else {
            setIsLoading(true);
            try {
                const response = await login({ email, password });

                if (response.success) {
                    sessionStorage.setItem("authDetails", JSON.stringify(response));
                    router.push("/dashboard");
                } else {
                    toast({
                        variant: "destructive", title: (
                            <div className="flex items-start gap-2">
                                <XCircle className="h-11 w-9 text-white" />
                                <div className="flex flex-col">
                                    <span className="font-semibold text-base">Error</span>
                                    <span className="text-sm font-light">Login failed. Please check your credentials and try again.</span>
                                </div>
                            </div>
                        ) as unknown as string, duration: 5000
                    });
                }
            } catch (error) {
                console.error("Login error:", error);
                toast({
                    variant: "destructive", title: (
                        <div className="flex items-start gap-2">
                            <XCircle className="h-11 w-9 text-white" />
                            <div className="flex flex-col">
                                <span className="font-semibold text-base">Error</span>
                                <span className="text-sm font-light">An error occurred during login. Please try again.</span>
                            </div>
                        </div>
                    ) as unknown as string, duration: 5000
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleBack = () => {
        setShowOtp(false);
        setPassword(""); // Clear password when going back
    };

    return (
        <>
            <div className="relative min-h-screen flex flex-col lg:flex-row">
                <Image
                    src="/image 2.svg"
                    alt="Professional workspace"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40"></div>

                <div className="relative z-10 w-full lg:w-2/5 flex flex-col p-4 sm:p-6 lg:p-8 flex-1">
                    <div className="mb-6 lg:mb-0 h-24">
                        <Image
                            src="/Frame 32.svg"
                            alt="SourceBytes.AI Logo"
                            width={190}
                            height={45}
                            className="w-[180px] sm:w-[250px] h-auto"
                        />
                    </div>

                    <div className="text-white mb-6 lg:mb-0 h-[calc(100vh-170px)] flex justify-center flex-col">
                        {/* <h1 className="font-gilroy font-semibold text-lg sm:text-[22px] leading-[1.4] sm:leading-[35px] text-left decoration-from-font decoration-skip-ink-none mb-4 sm:mb-8">
                         Trusted by Early Adopters to Transform Enterprise Intelligence – Join the Growing Revolution with{" "}
                            <span className="text-[#EF6A37]">SourceBytes.AI</span>
                        </h1> */}
                        <h1 className="font-gilroy font-semibold text-lg sm:text-[22px] leading-[1.4] sm:leading-[35px] text-left decoration-from-font decoration-skip-ink-none mb-4 sm:mb-8">
                            {translations?.login?.banner_text_1_part1}{" "}
                            <span className="text-[#EF6A37]">{translations?.app_name}</span>
                            {translations?.login?.banner_text_1_part2}
                        </h1>

                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-xs sm:text-sm">
                            <div className="flex items-center font-gilroy font-semibold text-[13px] sm:text-[15px] leading-[15px] text-left">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {translations?.login?.banner_text_2}
                            </div>
                            <div className="flex items-center font-gilroy font-semibold text-[13px] sm:text-[15px] leading-[15px] text-left">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {translations?.login?.banner_text_3}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 w-full lg:w-3/5 py-4 px-4 sm:p-4 flex-1">
                    <div className="w-full h-full bg-white rounded-2xl p-6 sm:p-8 md:p-10 lg:p-16 shadow-xl">
                        <div className="flex flex-col h-full">
                            <div className="h-[calc(100vh-400px)] flex flex-col justify-end flex-auto mb-28">
                                <div className="mb-6 sm:mb-8 lg:mb-12">
                                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-sourcebytes/10 rounded-lg flex items-center justify-center mb-4 sm:mb-8">
                                        <Image
                                            src="/SYEEKBYET LOGO bg 1.svg"
                                            alt="SourceBytes.AI Logo"
                                            width={40}
                                            height={40}
                                            className="w-[32px] h-[32px] sm:w-[40px] sm:h-[40px]"
                                        />
                                    </div>
                                    <p className="text-slate-500 font-gilroy text-sm">
                                        {translations?.login?.login_text_1_part_1} <span className="text-slate-500 font-semibold">{translations?.app_name}</span> {translations?.login?.login_text_1_part_2}
                                    </p>
                                    <h2 className="font-gilroy text-slate-950 font-medium text-xl sm:text-[30px] leading-tight sm:leading-[37.14px] mt-2">
                                        {showOtp ? translations?.login?.login_text_7 : translations?.login?.login_text_2}
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {!showOtp ? (
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder={translations?.login?.login_text_3}
                                            className="w-full text-gray-500 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#EF6A37] focus:border-transparent text-sm"
                                        />
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder={translations?.login?.login_text_7}
                                                className="w-full text-gray-500 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#EF6A37] focus:border-transparent text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.79m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex gap-4">
                                        {showOtp && (
                                            <button
                                                onClick={handleBack}
                                                className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm hover:bg-gray-300 flex items-center justify-center gap-2"
                                            >
                                                <ArrowLeft size={18} />
                                                {translations?.login?.login_back_btn}
                                            </button>
                                        )}
                                        <button
                                            onClick={handleSubmit}
                                            className={`w-full px-4 py-3 bg-[#EF6A37] text-white rounded-lg font-medium transition-colors text-sm ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#EF6A37]/85"} flex items-center justify-center gap-2`}
                                            disabled={isLoading}
                                        >
                                            {showOtp ? translations?.login?.login_login_btn : translations?.login?.login_text_4}
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="h-48 flex flex-col justify-end flex-1">
                                <p className="mt-4 text-xs text-gray-500">
                                    {translations?.login?.terms_text}{" "}
                                    <a href="#" className="text-[#EF6A37] hover:underline">
                                        {translations?.login?.privacy_policy}
                                    </a>{" "}
                                    and{" "}
                                    <a href="#" className="text-[#EF6A37] hover:underline">
                                        {translations?.login?.terms_of_use}
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <Loader size="lg" className="text-white" />
                </div>
            )}
        </>
    );
}