"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { CiMicrophoneOn } from "react-icons/ci";
import { ChatHistory } from "@/components/History";
import { FiCopy } from "react-icons/fi";
import Image from "next/image";
import { FaPlay, FaStop } from "react-icons/fa";
import { getChatHistory, sendChat } from "./apicalls/chat";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { PiRecordFill } from "react-icons/pi";
import TypingIndicator from "./typing-indicator";

// Dummy file data for suggestions
const dummyFiles = [
    { id: 1, name: "Paracetamol.zip" },
    { id: 2, name: "Paroxetine.zip" },
    { id: 3, name: "Paroxetine CR (Controlled Release).zip" },
    { id: 4, name: "Paromomycin.zip" },
    { id: 5, name: "Paricalcitol.zip" },
    { id: 6, name: "Paroxetine Mesylate.zip" },
    { id: 7, name: "Paroxetine Hydrochloride.zip" },
    { id: 8, name: "Paroxetine Mesylate Hydrochloride.zip" },
];

export const ChatComponent = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const [attachedFiles, setAttachedFiles] = useState<{ blob: Blob; filename: string }[]>([]);
    const [selectedHistory, setSelectedHistory] = useState<any>(null);
    const [newChat, setNewChat] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);
    const { toast } = useToast();
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const { translations } = useLanguage();
    const [isSending, setIsSending] = useState<boolean>(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isHistoryOpen, setIsHistoryOpen] = useState(true);
    const [suggestions, setSuggestions] = useState<typeof dummyFiles>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced search function
    const debouncedSearch = useCallback((searchTerm: string) => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            if (searchTerm.trim() === "") {
                setSuggestions([]);
                return;
            }

            const filteredFiles = dummyFiles.filter(file =>
                file.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSuggestions(filteredFiles);
        }, 500); // 300ms debounce delay
    }, []);

    // Handle input change with suggestion logic
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInputText(value);

        if (value.startsWith("/") && value.length > 1) {
            const searchTerm = value.slice(1);
            setShowSuggestions(true);
            debouncedSearch(searchTerm);
        } else {
            setShowSuggestions(false);
            setSuggestions([]);
        }
    };

    // Handle suggestion selection
    const handleSuggestionSelect = (fileName: string) => {
        const blob = new Blob([`Content of ${fileName}`], { type: "text/plain" });
        setAttachedFiles((prev) => [...prev, { blob, filename: fileName }]);
        setInputText("");
        setShowSuggestions(false);
        setSuggestions([]);
    };

    useEffect(() => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Speech Recognition is not supported in this browser.");
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event: any) => {
            let interimTranscript = "";
            let finalTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + " ";
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setTranscript(transcript + finalTranscript + interimTranscript);
            setInputText(finalTranscript + interimTranscript);
        };

        if (isListening) recognition.start();
        else recognition.stop();

        return () => recognition.stop();
    }, [isListening]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        if (pastedText) {
            const blob = new Blob([pastedText], { type: 'text/plain' });
            const filename = `pasted_text_${Date.now()}.txt`;
            setAttachedFiles((prev) => [...prev, { blob, filename }]);
        }
    };

    const handleSendMessage = async () => {
        if (inputText.trim() === "" && attachedFiles.length === 0) return;

        const authDetails = JSON.parse(sessionStorage.getItem("authDetails") || "{}");
        const token = authDetails?.data?.token;
        setIsGenerating(true);

        const userMessage = {
            id: Math.floor(Math.random() * 10000000).toString(),
            message: inputText,
            message_author_type: "user",
            conversation_id: selectedHistory?.id || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            attachedFiles: [...attachedFiles],
        };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setAttachedFiles([]);
        setInputText("");
        setIsSending(true);

        try {
            const chatResponse = await sendChat(token, {
                message: inputText,
                conversation_id: selectedHistory?.id || "",
            });

            const agentMessage = {
                id: chatResponse.data.data.assistant_response.id,
                message: chatResponse.data.data.assistant_response.message,
                message_author_type: "assistant",
                conversation_id: chatResponse.data.data.assistant_response.conversation_id,
                created_at: chatResponse.data.data.assistant_response.created_at,
                updated_at: chatResponse.data.data.assistant_response.updated_at,
            };

            setMessages((prevMessages) => [...prevMessages, agentMessage]);
            setIsSending(false);

            if (!selectedHistory) {
                setNewChat(agentMessage.conversation_id);
                setSelectedHistory({
                    created_at: agentMessage.created_at,
                    id: agentMessage.conversation_id,
                    name: userMessage.message || "Attached files",
                    updated_at: agentMessage.updated_at,
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: (
                    <div className="flex items-start gap-2">
                        <XCircle className="h-11 w-9 text-white" />
                        <div className="flex flex-col">
                            <span className="font-semibold text-base">Error</span>
                            <span className="text-sm font-light">Failed to send message</span>
                        </div>
                    </div>
                ) as unknown as string,
                duration: 5000,
            });
            console.error(error);
            setIsSending(false);
        }
        setIsGenerating(false);
    };

    const handleCopyMessage = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({
                variant: "success",
                title: (
                    <div className="flex items-start gap-2">
                        <CheckCircle className="h-11 w-9 text-white" />
                        <div className="flex flex-col">
                            <span className="font-semibold text-base">Copied</span>
                            <span className="text-sm font-light">Message copied to clipboard!</span>
                        </div>
                    </div>
                ) as unknown as string,
                duration: 5000,
            });
        });
    };

    const handlePlayMessage = (messageId: number, text: string) => {
        if (playingMessageId === messageId) {
            speechSynthesis.cancel();
            setPlayingMessageId(null);
            utteranceRef.current = null;
        } else {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utteranceRef.current = utterance;
            utterance.onend = () => {
                setPlayingMessageId(null);
                utteranceRef.current = null;
            };
            speechSynthesis.speak(utterance);
            setPlayingMessageId(messageId);
        }
    };

    const handleDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const loadListings = async (selectedHistory: any) => {
        try {
            const authDetails = JSON.parse(sessionStorage.getItem("authDetails") || "{}");
            const token = authDetails?.data?.token;
            if (!token) throw new Error("No auth token found");

            const fetchedListings = await getChatHistory(token, selectedHistory?.id);
            setMessages(fetchedListings?.data?.messages);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (selectedHistory) {
            loadListings(selectedHistory);
        } else {
            setMessages([]);
        }
        return () => {
            speechSynthesis.cancel();
            setPlayingMessageId(null);
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [selectedHistory]);

    return (
        <div className="bg-white text-zinc-900 flex">
            <div className="flex-1 flex flex-col">
                <div className="flex-1 flex relative">
                    <main className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full relative h-[calc(100vh-100px)]">
                        <div className={`flex-1 overflow-y-auto chat-container ${messages?.length > 0 ? "mb-20" : ""}`}>
                            {messages?.length === 0 ? (
                                <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
                                    <div className="text-center space-y-6">
                                        <h2 className="text-3xl font-bold text-zinc-900">{translations?.admin?.chat_text_1}</h2>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 rounded-xl w-full bg-gradient-to-r from-[#fef4e5] to-[#f9cda1]">
                                    <div className="space-y-4 bg-white rounded-xl p-4">
                                        {messages?.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.message_author_type === "user" ? "justify-end" : "justify-start items-center"}`}
                                            >
                                                {message.message_author_type !== "user" && (
                                                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mr-1 shrink-0 overflow-hidden">
                                                        <Image
                                                            src="/SYEEKBYET LOGO bg 2.svg"
                                                            alt="SourceBytes.AI Logo"
                                                            width={48}
                                                            height={48}
                                                            className="w-8 h-8 object-contain"
                                                        />
                                                    </div>
                                                )}
                                                <div
                                                    className={`py-2 p-4 rounded-3xl max-w-[80%] ${message.message_author_type === "user" ? "bg-[#FAF6F6]" : "bg-zinc-100 ml-8"} group relative flex items-center gap-2`}
                                                >
                                                    <p className="text-sm flex-1">{message.message}</p>
                                                    {message.attachedFiles?.length > 0 && (
                                                        <div className="mt-2">
                                                            <span>Attached files:</span>
                                                            <ul>
                                                                {message.attachedFiles.map((file: { blob: Blob; filename: string }, index: number) => (
                                                                    <li key={index}>
                                                                        <a
                                                                            href="#"
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                handleDownload(file.blob, file.filename);
                                                                            }}
                                                                            className="text-blue-500 hover:underline"
                                                                        >
                                                                            {file.filename}
                                                                        </a>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {message.message_author_type !== "user" && (
                                                        <button
                                                            onClick={() => handlePlayMessage(message.id, message.message)}
                                                            className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center shrink-0 overflow-hidden transition-transform duration-200 hover:scale-110"
                                                        >
                                                            {playingMessageId === message.id ? (
                                                                <FaStop className="text-gray-400 text-xs" />
                                                            ) : (
                                                                <FaPlay className="text-gray-400 text-xs" />
                                                            )}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleCopyMessage(message.message)}
                                                        className="text-zinc-500 hover:text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                    >
                                                        <FiCopy className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {isSending && (
                                            <div className="flex justify-start items-center">
                                                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mr-1 shrink-0 overflow-hidden">
                                                    <Image
                                                        src="/SYEEKBYET LOGO bg 2.svg"
                                                        alt="SourceBytes.AI Logo"
                                                        width={48}
                                                        height={48}
                                                        className="w-8 h-8 object-contain"
                                                    />
                                                </div>
                                                <div className="py-2 p-4 rounded-3xl max-w-[80%] bg-zinc-100 ml-8 group relative flex items-center gap-2">
                                                    <div className="text-sm flex-1">
                                                        <TypingIndicator />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div
                            className={`${messages?.length === 0 ? "absolute top-1/2 mt-9 left-6 right-6 transform -translate-y-1/2" : "absolute bottom-6 left-6 right-6"} flex flex-col gap-2 bg-white p-4 rounded-lg shadow-md`}
                        >
                            {/* Attached Files Section */}
                            {attachedFiles.length > 0 && (
                                <div className="bg-gradient-to-r from-[#fef4e5] to-[#f9cda1] p-3 rounded-lg shadow-sm flex flex-wrap gap-2">
                                    {attachedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="bg-white p-2 rounded-md border border-gray-200 flex flex-col relative max-w-[200px]"
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span className="text-blue-500 text-sm truncate">{file.filename}</span>
                                                <button
                                                    onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== index))}
                                                    className="text-red-500 text-xs font-bold"
                                                >
                                                    X
                                                </button>
                                            </div>
                                            <span className="text-black text-xs">Selected</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Input Area with Suggestions */}
                            <div className="relative flex items-center gap-2">
                                <button
                                    className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 transition-colors shrink-0"
                                    onClick={() => setIsListening((prev) => !prev)}
                                >
                                    {isListening ? (
                                        <PiRecordFill className="w-6 h-6 text-red-700" />
                                    ) : (
                                        <CiMicrophoneOn className="w-6 h-6 text-zinc-700" />
                                    )}
                                </button>
                                <div className="flex-1 relative">
                                    <textarea
                                        readOnly={isGenerating}
                                        value={inputText}
                                        onChange={handleInputChange}
                                        onPaste={handlePaste}
                                        placeholder={translations?.admin?.chat_input_placeholder}
                                        className="flex-1 p-3 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm resize-none overflow-hidden w-full"
                                        rows={1}
                                        onInput={(e) => {
                                            const target = e.target as HTMLTextAreaElement;
                                            target.style.height = "auto";
                                            target.style.maxHeight = "300px";
                                            void target.offsetHeight;
                                            target.style.height = `${target.scrollHeight}px`;
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey && !isGenerating) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            } else if (e.key === "ArrowDown" && showSuggestions) {
                                                e.preventDefault();
                                                // Add keyboard navigation logic if needed
                                            }
                                        }}
                                        disabled={isGenerating}
                                    />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto z-10">
                                            {suggestions.map((file) => (
                                                <div
                                                    key={file.id}
                                                    className="p-2 hover:bg-blue-100 cursor-pointer text-sm"
                                                    onClick={() => handleSuggestionSelect(file.name)}
                                                >
                                                    {file.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    className={`bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 transition-colors shrink-0 flex items-center justify-center w-10 h-10`}
                                >
                                    <img src="/send-2.svg" className="w-6 h-6" alt="Send" />
                                </button>
                            </div>
                        </div>
                    </main>
                    <ChatHistory
                        historyData={newChat}
                        onHistorySelect={setSelectedHistory}
                        isOpen={isHistoryOpen}
                        setIsOpen={setIsHistoryOpen}
                    />
                </div>
            </div>
        </div>
    );
};