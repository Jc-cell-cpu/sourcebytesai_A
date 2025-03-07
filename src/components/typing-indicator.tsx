"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/context/LanguageContext"

interface TypingIndicatorProps {
  size?: number
  bubbleColor?: string
  dotColor?: string
  speed?: number
  text?: string
  showText?: boolean
  align?: "left" | "right"
}

// const { translations } = useLanguage();
export default function TypingIndicator({
  size = 10,
  bubbleColor = "#f1f5f9", // Light gray bubble
  dotColor = "#64748b", // Slate gray dots
  speed = 1,
  text = "Chatbot is typing",
  // text = translations?.Typing?.Chatbot_is_typing,
  showText = true,
  align = "left",
}: TypingIndicatorProps) {
  const [dots, setDots] = useState("")


  // Animate the dots for the text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return ""
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // Animation variants for the typing dots
  const dotVariants = {
    initial: { y: 0 },
    animate: (i: number) => ({
      y: [0, -10, 0],
      transition: {
        duration: 1.2 / speed,
        repeat: Number.POSITIVE_INFINITY,
        delay: i * 0.2,
        ease: "easeInOut",
      },
    }),
  }

  return (
    <div className={`flex ${align === "left" ? "justify-start" : "justify-end"} items-center`}>
      <div
        className={`flex items-center py-2 px-4 rounded-2xl ${align === "left" ? "rounded-tl-none" : "rounded-tr-none"}`}
        style={{ backgroundColor: bubbleColor }}
      >
        <div className="flex items-center space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              custom={i}
              variants={dotVariants}
              initial="initial"
              animate="animate"
              className="rounded-full"
              style={{
                width: size,
                height: size,
                backgroundColor: dotColor,
              }}
            />
          ))}
        </div>

        {showText && (
          <div className="ml-3 text-sm font-medium opacity-75" style={{ color: dotColor }}>
            {text}
            {dots}
          </div>
        )}
      </div>
    </div>
  )
}

