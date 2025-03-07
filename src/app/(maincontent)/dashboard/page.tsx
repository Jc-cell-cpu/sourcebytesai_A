"use client"; // Mark this component as a Client Component

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatComponent } from "@/components/ChatComponent";
import SuperAdmindashboard from "@/components/SuperAdmindashboard";
import Loader from "@/components/Loader";

const Dashboard = () => {
    const [role, setRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Explicit loading state
    const router = useRouter();

    useEffect(() => {
        const fetchRole = async () => {
            try {
                setIsLoading(true); // Ensure loading starts
                const authDetails = sessionStorage.getItem("authDetails");

                if (!authDetails) {
                    router.push("/"); // Redirect to login if no auth details
                    return;
                }

                const userRole = JSON.parse(authDetails)?.data?.user_type;
                if (!userRole) {
                    router.push("/dashboard"); // Redirect if no user_type found
                    return;
                }

                setRole(userRole);
            } catch (error) {
                console.error("Error fetching role:", error);
                router.push("/"); // Redirect on error
            } finally {
                setIsLoading(false); // Stop loading once done
            }
        };

        fetchRole();
    }, [router]);

    // Show loader while fetching role
    // if (isLoading || !role) {
    //     return (
    //         <div className="fixed inset-0 bg-black/50 z-auto flex items-center justify-center">
    //             <Loader size="sm" className="text-red-800" />
    //             <span className="ml-4 text-white text-lg"><Loader size="sm" className="text-red-800" /></span>
    //         </div>
    //     );
    // }

    if (!role) {
        return <ChatComponent />;
    }

    // Render dashboard content once role is determined
    return (
        <div>
            {role === "superuser" ? <SuperAdmindashboard /> : <ChatComponent />}
        </div>
    );
};

export default Dashboard;