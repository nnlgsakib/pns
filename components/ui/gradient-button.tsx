import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { forwardRef } from "react"

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger"
  size?: "sm" | "md" | "lg" | "xl"
  isLoading?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
}

const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    { className, variant = "primary", size = "md", isLoading, children, icon, iconPosition = "left", ...props },
    ref,
  ) => {
    const baseClasses =
      "relative overflow-hidden font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 rounded-xl flex items-center justify-center gap-2 border-0 focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:transform-none disabled:hover:scale-100"

    const variantClasses = {
      primary:
        "bg-gradient-to-r from-[#005eff] to-[#0041cc] text-white hover:shadow-lg hover:shadow-[#005eff]/25 focus:ring-[#005eff]/50",
      secondary:
        "border-2 border-[#005eff] text-[#005eff] bg-transparent hover:bg-[#005eff] hover:text-white focus:ring-[#005eff]/50",
      danger:
        "bg-gradient-to-r from-[#ff4444] to-[#cc3333] text-white hover:shadow-lg hover:shadow-[#ff4444]/25 focus:ring-[#ff4444]/50",
    }

    const sizeClasses = {
      sm: "px-3 py-2 text-sm h-8 min-w-[80px]",
      md: "px-4 py-2.5 text-base h-10 min-w-[100px]",
      lg: "px-6 py-3 text-lg h-12 min-w-[120px]",
      xl: "px-8 py-4 text-xl h-14 min-w-[140px]",
    }

    const iconSizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
      xl: "w-7 h-7",
    }

    return (
      <Button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          isLoading && "opacity-70 cursor-not-allowed",
          className,
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
            <div
              className={cn(
                "border-2 border-white border-t-transparent rounded-full animate-spin",
                iconSizeClasses[size],
              )}
            />
          </div>
        )}

        <span className={cn("flex items-center gap-2", isLoading && "opacity-0")}>
          {icon && iconPosition === "left" && (
            <span className={cn("flex items-center justify-center", iconSizeClasses[size])}>{icon}</span>
          )}
          {children}
          {icon && iconPosition === "right" && (
            <span className={cn("flex items-center justify-center", iconSizeClasses[size])}>{icon}</span>
          )}
        </span>
      </Button>
    )
  },
)

GradientButton.displayName = "GradientButton"

export { GradientButton }
