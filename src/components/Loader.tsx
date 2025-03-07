"use client"

interface LoaderProps {
    size?: "sm" | "md" | "lg" | "xl"
    className?: string
}

export default function Loader({ size = "md", className = "" }: LoaderProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
        xl: "h-18 w-18"
    }[size]

    return (
        <div className={`relative aspect-square ${sizeClasses} ${className}`}>
            <style jsx>{`
                @keyframes fade {
                    0% { opacity: 1; }
                    50% { opacity: 0.2; }
                    100% { opacity: 1; }
                }
                
                .segment {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    height: 30%;
                    width: 12%;
                    transform-origin: center;
                    border-radius: 2px;
                    background-color: currentColor;
                    transform: translateX(-50%);
                    animation: fade 1.6s infinite;
                }
            `}</style>

            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="segment"
                    style={{
                        transform: `rotate(${i * 45}deg) translateY(-85%)`,
                        animationDelay: `${i * 0.4}s`
                    }}
                />
            ))}
        </div>
    )
}