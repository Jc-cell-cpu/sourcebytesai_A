import { cn } from "@/lib/utils"

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: 'small' | 'medium' | 'large'
    showText?: boolean
}

export function Loader({ size = 'medium', showText = true, className, ...props }: LoaderProps) {
    const sizeClasses = {
        small: 'w-8 h-8',
        medium: 'w-12 h-12',
        large: 'w-16 h-16'
    }

    const innerSizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-6 h-6',
        large: 'w-8 h-8'
    }

    return (
        <div className={cn("flex items-center justify-center", className)} {...props}>
            <div className="relative" aria-label="Loading" role="status">
                {/* Outer circle */}
                <div className={cn(sizeClasses[size], "rounded-full border-4 border-primary/10 border-t-primary animate-spin")} />
                {/* Inner circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className={cn(innerSizeClasses[size], "rounded-full border-4 border-secondary/10 border-t-secondary animate-spin")} />
                </div>
            </div>
            {showText && <span className="ml-4 text-muted-foreground">Loading...</span>}
        </div>
    )
}

