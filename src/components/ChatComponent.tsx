"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { CiMicrophoneOn } from "react-icons/ci";
import { ChatHistory } from "@/components/History";
import { FiCopy } from "react-icons/fi";
import Image from "next/image";
import { FaPlay, FaStop } from "react-icons/fa";
import { getChatHistory, sendChat } from "./apicalls/chat";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { PiRecordFill } from "react-icons/pi";
import TypingIndicator from "./typing-indicator";
import CodeEditor from "./code-editor";
import hljs from "highlight.js"; // Import highlight.js

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

// Language detection using highlight.js
const detectLanguage = (text: string): { extension: string; mimeType: string } => {
    const result = hljs.highlightAuto(text);
    const lang = result.language || "markdown"; // Default to markdown if no language detected

    const languageMap: Record<string, { extension: string; mimeType: string }> = {
        javascript: { extension: "js", mimeType: "text/javascript" },
        typescript: { extension: "ts", mimeType: "text/typescript" },
        jsx: { extension: "jsx", mimeType: "text/jsx" },
        tsx: { extension: "tsx", mimeType: "text/tsx" },
        python: { extension: "py", mimeType: "text/x-python" },
        json: { extension: "json", mimeType: "application/json" },
        html: { extension: "html", mimeType: "text/html" },
        css: { extension: "css", mimeType: "text/css" },
        sass: { extension: "sass", mimeType: "text/x-sass" },
        scss: { extension: "scss", mimeType: "text/x-scss" },
        less: { extension: "less", mimeType: "text/x-less" },
        markdown: { extension: "md", mimeType: "text/markdown" },
        xml: { extension: "xml", mimeType: "text/xml" },
        yaml: { extension: "yaml", mimeType: "text/yaml" },
        java: { extension: "java", mimeType: "text/x-java-source" },
        c: { extension: "c", mimeType: "text/x-csrc" },
        cpp: { extension: "cpp", mimeType: "text/x-c++src" },
        csharp: { extension: "cs", mimeType: "text/x-csharp" },
        php: { extension: "php", mimeType: "application/x-httpd-php" },
        ruby: { extension: "rb", mimeType: "text/x-ruby" },
        swift: { extension: "swift", mimeType: "text/x-swift" },
        kotlin: { extension: "kt", mimeType: "text/x-kotlin" },
        go: { extension: "go", mimeType: "text/x-go" },
        rust: { extension: "rs", mimeType: "text/x-rust" },
        r: { extension: "r", mimeType: "text/x-rsrc" },
        shell: { extension: "sh", mimeType: "application/x-sh" },
        sql: { extension: "sql", mimeType: "application/sql" },
        perl: { extension: "pl", mimeType: "text/x-perl" },
        lua: { extension: "lua", mimeType: "text/x-lua" },
        dart: { extension: "dart", mimeType: "text/x-dart" },
        scala: { extension: "scala", mimeType: "text/x-scala" },
        objectivec: { extension: "m", mimeType: "text/x-objectivec" },
        objectivecpp: { extension: "mm", mimeType: "text/x-objectivec++" },
        latex: { extension: "tex", mimeType: "application/x-tex" },
        vb: { extension: "vb", mimeType: "text/x-vb" },
        powershell: { extension: "ps1", mimeType: "application/x-powershell" },
        dockerfile: { extension: "dockerfile", mimeType: "text/x-dockerfile" },
        graphql: { extension: "graphql", mimeType: "application/graphql" },
        ini: { extension: "ini", mimeType: "text/plain" },
        toml: { extension: "toml", mimeType: "text/plain" },
        properties: { extension: "properties", mimeType: "text/plain" },
        makefile: { extension: "mk", mimeType: "text/x-makefile" },
        asm: { extension: "asm", mimeType: "text/x-assembly" },
        matlab: { extension: "m", mimeType: "text/x-matlab" },
        hcl: { extension: "hcl", mimeType: "text/x-hcl" },
        vue: { extension: "vue", mimeType: "text/x-vue" },
        svelte: { extension: "svelte", mimeType: "text/x-svelte" },
        elm: { extension: "elm", mimeType: "text/x-elm" },
        clojure: { extension: "clj", mimeType: "text/x-clojure" },
        fsharp: { extension: "fs", mimeType: "text/x-fsharp" },
        pascal: { extension: "pas", mimeType: "text/x-pascal" },
        julia: { extension: "jl", mimeType: "text/x-julia" },
        wasm: { extension: "wasm", mimeType: "application/wasm" }
    };



    return (
        languageMap[lang] || { extension: "md", mimeType: "text/markdown" } // Fallback to Markdown
    );
};

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

    // State for preview/edit modal
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<{ blob: Blob; filename: string } | null>(null);
    const [editedContent, setEditedContent] = useState("");

    const debouncedSearch = useCallback((searchTerm: string) => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
            if (searchTerm.trim() === "") {
                setSuggestions([]);
                return;
            }
            const filteredFiles = dummyFiles.filter((file) =>
                file.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSuggestions(filteredFiles);
        }, 500);
    }, []);

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

    const handleSuggestionSelect = (fileName: string) => {
        const blob = new Blob([`Content of ${fileName}`], { type: "text/plain" });
        setAttachedFiles((prev) => [...prev, { blob, filename: fileName }]);
        setInputText("");
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleFilePreview = async (file: { blob: Blob; filename: string }) => {
        try {
            const text = await file.blob.text();
            setSelectedFile(file);
            setEditedContent(text);
            setIsPreviewOpen(true);
        } catch (error) {
            console.error("Error reading file content:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to read file content",
                duration: 5000,
            });
        }
    };

    const handleSaveEdit = () => {
        if (selectedFile) {
            const { mimeType } = detectLanguage(editedContent); // Re-detect language on save
            const newBlob = new Blob([editedContent], { type: mimeType });
            setAttachedFiles((prev) =>
                prev.map((f) => (f.filename === selectedFile.filename ? { ...f, blob: newBlob } : f))
            );
            setIsPreviewOpen(false);
        }
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
        const pastedText = e.clipboardData.getData("text");
        if (pastedText) {
            const { extension, mimeType } = detectLanguage(pastedText);
            const blob = new Blob([pastedText], { type: mimeType });
            const filename = `pasted_content_${Date.now()}.${extension}`;
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
                title: "Error",
                description: "Failed to send message",
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
                title: "Copied",
                description: "Message copied to clipboard!",
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
                                                    className={`message-container py-2 p-4 rounded-3xl max-w-[80%] ${message.message_author_type === "user" ? "bg-[#FAF6F6]" : "bg-zinc-100 ml-8"} group relative flex items-center gap-2`}
                                                >
                                                    <p className="text-sm flex-1">{message.message}</p>
                                                    {message.attachedFiles?.length > 0 && (
                                                        <div className="mt-2">
                                                            <span>Attached files:</span>
                                                            <ul>
                                                                {message.attachedFiles.map((file: { blob: Blob; filename: string }, index: number) => (
                                                                    <li key={index}>
                                                                        <button
                                                                            onClick={() => handleFilePreview(file)}
                                                                            className="text-blue-500 hover:underline cursor-pointer file-link"
                                                                            style={{ pointerEvents: "auto", zIndex: 1000 }}
                                                                        >
                                                                            {file.filename}
                                                                        </button>
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
                            {attachedFiles.length > 0 && (
                                <div className="bg-gradient-to-r from-[#fef4e5] to-[#f9cda1] p-3 rounded-lg shadow-sm flex flex-wrap gap-2">
                                    {attachedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="bg-white p-4 rounded-md shadow-md relative max-w-[200px] fold-effect"
                                        >
                                            <span
                                                className="text-blue-500 text-sm truncate block cursor-pointer"
                                                onClick={() => handleFilePreview(file)}
                                            >
                                                {file.filename}
                                            </span>
                                            <span className="text-black text-xs block mt-1">Selected</span>
                                            <button
                                                onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== index))}
                                                className="absolute top-1 p-1 right-1 text-black bg-white text-xs font-bold rounded-xl border-zinc-50 shadow-2xl"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

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
                                            }
                                        }}
                                        disabled={isGenerating}
                                    />
                                    <button
                                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 rounded"
                                        title="Switch to code editor"
                                    >
                                        <img src="/Upload.svg" className="w-6 h-6" alt="Send" />
                                    </button>
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

            {/* Updated Modal with CodeEditor */}
            {isPreviewOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1000">
                    <div className="bg-gradient-to-r from-[#fef4e5] to-[#f9cda1] mt-10 rounded-2xl p-6 w-[50%] h-[85%] md:h-[90%] md:w-[45%]">
                        <div className="flex justify-between items-center mb-4">
                            <button
                                onClick={() => {
                                    handleSaveEdit();
                                    setIsPreviewOpen(false);
                                }}
                                className="text-black mr-3"
                            >
                                <X className="h-7 w-7" />
                            </button>
                            <h2 className="text-lg font-bold flex-1">{selectedFile?.filename}</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveEdit}
                                    className="p-2 text-black"
                                    title="Save"
                                >
                                    <img src="/Upload.svg" className="w-[1.5rem] h-[1.5rem]" alt="Save" />
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(editedContent).then(() => {
                                            toast({
                                                variant: "success",
                                                title: "Copied",
                                                description: "Content copied to clipboard!",
                                                duration: 3000,
                                            });
                                        });
                                    }}
                                    className="p-2 text-black"
                                    title="Copy"
                                >
                                    <FiCopy className="h-[1.5rem] w-[1.5rem]" />
                                </button>
                                <button
                                    onClick={() => {
                                        const modal = document.querySelector(".modal-container");
                                        if (modal) {
                                            modal.classList.toggle("w-[50%]");
                                            modal.classList.toggle("w-full");
                                            modal.classList.toggle("h-[85%]");
                                            modal.classList.toggle("h-full");
                                        }
                                    }}
                                    className="p-2 text-black"
                                    title="Expand"
                                >
                                    <img src="/Expand.svg" className="w-[1.2rem] h-[1.2rem]" alt="Expand" />
                                </button>
                            </div>
                        </div>
                        <CodeEditor
                            value={editedContent}
                            onChange={setEditedContent}
                            language={selectedFile?.filename.split('.').pop() || 'markdown'}
                            height="91%"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatComponent;