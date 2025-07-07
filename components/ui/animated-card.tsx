import type React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { forwardRef } from "react"

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "gradient" | "glass"
  hover?: boolean
  glow?: boolean
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, variant = "default", hover = true, glow = false, children, ...props }, ref) => {
    const baseClasses = "transition-all duration-300 rounded-2xl border backdrop-blur-sm"

    const variantClasses = {
      default: "bg-[#1a1a1a]/80 border-[#2a2a2a]/50",
      elevated: "bg-[#2a2a2a]/80 shadow-lg border-[#3a3a3a]/50",
      gradient: "bg-gradient-to-br from-[#1a1a1a]/80 to-[#2a2a2a]/80 border-[#2a2a2a]/50",
      glass: "bg-white/5 border-white/10 backdrop-blur-md",
    }

    const hoverClasses = hover
      ? "hover:scale-[1.02] hover:shadow-xl hover:shadow-[#005eff]/10 hover:border-[#005eff]/30"
      : ""

    const glowClasses = glow ? "shadow-lg shadow-[#005eff]/20 border-[#005eff]/30" : ""

    return (
      <Card
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], hoverClasses, glowClasses, className)}
        {...props}
      >
        {children}
      </Card>
    )
  },
)

AnimatedCard.displayName = "AnimatedCard"

export { AnimatedCard }
