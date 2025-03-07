"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, CheckCircle, Loader2, Pencil, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { editAdminProfile, getAdminProfile } from "@/components/apicalls/profile";
import { useToast } from "@/hooks/use-toast";
import Loader from "@/components/Loader";
import { useLanguage } from "@/context/LanguageContext";

export default function Settings() {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [name, setName] = useState("Khitish Mangal");
    const [email, setEmail] = useState("khitish@gmail.com");
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [avatar, setAvatar] = useState<string>("");
    const { toast } = useToast();
    const { lang, setLang } = useLanguage();
    const { translations } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const authDetails = JSON.parse(sessionStorage.getItem("authDetails") || "{}");
        const token = authDetails?.data?.token;
        const data = await editAdminProfile(token, { name, email });
        setLoading(false);

        if (data.success) {
            toast({
                variant: "success",
                title: (
                    <div className="flex items-start gap-2">
                        <CheckCircle className="h-11 w-9 text-white" />
                        <div className="flex flex-col">
                            <span className="font-semibold text-base">Edited Successfully</span>
                            <span className="text-sm font-light">Profile has been edited successfully.</span>
                        </div>
                    </div>
                ) as unknown as string,
                duration: 5000,
            });
            setIsEditModalOpen(false);
            getAdminProfileDetails();
        } else {
            toast({
                variant: "destructive",
                title: (
                    <div className="flex items-start gap-2">
                        <XCircle className="h-11 w-9 text-white" />
                        <div className="flex flex-col">
                            <span className="font-semibold text-base">Error</span>
                            <span className="text-sm font-light">Something went wrong!</span>
                        </div>
                    </div>
                ) as unknown as string,
                duration: 5000,
            });
        }
    };

    const getAdminProfileDetails = async () => {
        setLoading(true);
        try {
            const authDetails = JSON.parse(sessionStorage.getItem("authDetails") || "{}");
            const token = authDetails?.data?.token;
            if (!token) {
                console.error("No auth token found");
                toast({
                    variant: "destructive",
                    title: (
                        <div className="flex items-start gap-2">
                            <XCircle className="h-11 w-9 text-white" />
                            <div className="flex flex-col">
                                <span className="font-semibold text-base">Error</span>
                                <span className="text-sm font-light">No auth token found.</span>
                            </div>
                        </div>
                    ) as unknown as string,
                    duration: 5000,
                });
                return;
            }

            const fetchedListings = await getAdminProfile(token);
            setProfile(fetchedListings.data.data);
            const nameAvatar = fetchedListings.data.data.name.split(" ");
            setName(fetchedListings.data.data.name);
            setEmail(fetchedListings.data.data.email);
            setAvatar(
                nameAvatar?.[0]?.charAt(0).toUpperCase() +
                (nameAvatar.length > 1 ? nameAvatar?.[1]?.charAt(0)?.toUpperCase() : "")
            );
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAdminProfileDetails();
    }, []);

    return (
        <>
            <div className="container mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-6 lg:gap-8 max-w-6xl">
                {/* Left Column */}
                <div className="space-y-6 lg:space-y-8">
                    <div>
                        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{translations?.admin?.profile_details}</h2>
                        <Card>
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-3 sm:gap-4 bg-zinc-800 text-white p-2.5 sm:p-3 rounded-lg">
                                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                                        <AvatarImage src="/jck" alt="Profile picture" />
                                        <AvatarFallback className="text-black">{avatar}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold truncate">{profile?.name}</h3>
                                        <p className="text-xs sm:text-sm text-gray-300 truncate">{profile?.email}</p>
                                    </div>
                                    {/* Moved Edit Icon to Right */}
                                    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                                        <DialogTrigger asChild>
                                            <button className="text-gray-300 hover:text-white flex-shrink-0 ml-auto">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Edit Profile</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Name</Label>
                                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                </div>
                                                <Button type="submit" className="bg-orange-500">
                                                    {loading ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        "Save changes"
                                                    )}
                                                </Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{translations?.admin?.selected_language}</h2>
                        <Select defaultValue={lang} onValueChange={(value) => setLang(value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="jp">{translations?.admin?.japanese}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:max-w-sm">
                    <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{translations?.admin?.subscripted_plan}</h2>
                    <Card className="bg-[#F26B3A] text-white">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex justify-between items-start mb-4 sm:mb-6">
                                <h3 className="text-xl sm:text-2xl font-bold">{translations?.admin?.pro}</h3>
                                <div className="text-right">
                                    <div className="text-lg sm:text-xl font-bold">100k/{translations?.admin?.month}</div>
                                    <div className="text-xs sm:text-sm opacity-90">{translations?.admin?.started} 20.01.25</div>
                                </div>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                <h4 className="font-semibold text-sm sm:text-base">{translations?.admin?.payment_details} :</h4>
                                <div className="space-y-1.5 sm:space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 flex-shrink-0" />
                                        <span>{translations?.admin?.duration}: 12 Months</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 flex-shrink-0" />
                                        <span>{translations?.admin?.status}: {translations?.admin?.active}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 flex-shrink-0" />
                                        <span>{translations?.admin?.expiry_date}: 22.06.24</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 sm:mt-6">
                                <button className="w-full bg-white text-[#F26B3A] py-2 rounded-md font-medium flex items-center justify-center gap-2 text-sm">
                                    <Check className="h-4 w-4" />
                                    {translations?.admin?.selected}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
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