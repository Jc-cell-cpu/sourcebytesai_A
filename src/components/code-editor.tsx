"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import { FileCode } from "lucide-react";

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: string;
    height?: string;
    disabled?: boolean;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    title?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
    value,
    onChange,
    language = "javascript",
    height = "300px",
    disabled = false,
    onKeyDown,
    title = "Editor",
}) => {
    const editorRef = useRef<any>(null);

    const handleEditorDidMount = (editor: any, monaco: Monaco) => {
        editorRef.current = editor;

        editor.updateOptions({
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            automaticLayout: true,
            readOnly: disabled,
            padding: { top: 16, bottom: 16 },
        });

        if (onKeyDown) {
            editor.onKeyDown((e: any) => {
                const event = {
                    key: e.browserEvent.key,
                    shiftKey: e.browserEvent.shiftKey,
                    preventDefault: () => e.preventDefault(),
                } as React.KeyboardEvent;
                onKeyDown(event);
            });
        }

        // Define a custom theme with extended rules for multiple languages
        monaco.editor.defineTheme("stylishLight", {
            base: "vs",
            inherit: true,
            rules: [
                // General tokens (applicable to most languages)
                { token: "keyword", foreground: "7c3aed", fontStyle: "bold" }, // Vibrant purple keywords
                { token: "string", foreground: "16a34a" }, // Rich green strings
                { token: "comment", foreground: "94a3b8", fontStyle: "italic" }, // Slate comments
                { token: "number", foreground: "f59e0b" }, // Amber numbers
                { token: "function", foreground: "0ea5e9" }, // Sky blue functions
                { token: "type", foreground: "e11d48" }, // Rose types
                { token: "variable", foreground: "334155" }, // Slate variables
                { token: "operator", foreground: "9333ea" }, // Purple operators

                // Markdown-specific tokens
                { token: "emphasis", foreground: "e11d48", fontStyle: "italic" }, // Italics in Markdown
                { token: "strong", foreground: "7c3aed", fontStyle: "bold" }, // Bold in Markdown
                { token: "header", foreground: "0ea5e9" }, // Headers in Markdown
                { token: "link", foreground: "16a34a" }, // Links in Markdown

                // Python-specific tokens
                { token: "keyword.python", foreground: "7c3aed", fontStyle: "bold" },
                { token: "string.python", foreground: "16a34a" },
                { token: "function.python", foreground: "0ea5e9" },

                // JSON-specific tokens
                { token: "key.json", foreground: "334155" }, // JSON keys
                { token: "string.json", foreground: "16a34a" }, // JSON strings
                { token: "number.json", foreground: "f59e0b" }, // JSON numbers

                // Add more language-specific tokens as needed
            ],
            colors: {
                "editor.background": "#f8fafc",
                "editor.foreground": "#334155",
                "editorLineNumber.foreground": "#94a3b8",
                "editorLineNumber.activeForeground": "#7c3aed",
                "editor.selectionBackground": "#e9d5ff",
                "editor.inactiveSelectionBackground": "#f3e8ff",
                "editorCursor.foreground": "#7c3aed",
            },
        });

        monaco.editor.setTheme("stylishLight");
        editor.focus();
    };

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.updateOptions({ readOnly: disabled });
        }
    }, [disabled]);

    const actualHeight = "74vh";

    // Enhanced language display logic
    const languageDisplay = (() => {
        switch (language.toLowerCase()) {
            case "javascript":
                return "JavaScript";
            case "typescript":
                return "TypeScript";
            case "html":
                return "HTML";
            case "css":
                return "CSS";
            case "markdown":
            case "md":
                return "Markdown";
            case "python":
                return "Python";
            case "json":
                return "JSON";
            case "xml":
                return "XML";
            case "yaml":
            case "yml":
                return "YAML";
            default:
                return language.charAt(0).toUpperCase() + language.slice(1); // Capitalize unknown languages
        }
    })();

    return (
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-white to-slate-50 shadow-lg border border-slate-200">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-violet-100 rounded-md">
                        <FileCode className="h-4 w-4 text-violet-600" />
                    </div>
                    <span className="font-medium text-slate-700">{title}</span>
                    <div className="ml-2 px-2 py-0.5 bg-violet-100 rounded-full text-xs font-medium text-violet-700">
                        {languageDisplay}
                    </div>
                </div>
            </div>

            {/* Line Numbers Decoration */}
            <div className="absolute left-0 top-[42px] bottom-0 w-[50px] bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none opacity-50" />

            {/* Editor Container */}
            <div className="relative transition-all duration-300 ease-in-out" style={{ height: actualHeight }}>
                <Editor
                    height="100%"
                    language={language.toLowerCase()} // Ensure lowercase for Monaco compatibility
                    value={value}
                    onChange={(value) => onChange(value || "")}
                    onMount={handleEditorDidMount}
                    theme="stylishLight"
                    options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        lineNumbers: "on",
                        roundedSelection: true,
                        automaticLayout: true,
                        readOnly: disabled,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontLigatures: true,
                        cursorSmoothCaretAnimation: "on",
                        cursorBlinking: "smooth",
                    }}
                />

                {/* Bottom Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
            </div>
        </div>
    );
};

export default CodeEditor;