import { cn } from "@/lib/utils"

interface SustainabilityScoreProps {
  score: number
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function SustainabilityScore({ score, size = "md", showText = true, className }: SustainabilityScoreProps) {
  const getScoreColor = (score: number) => {
    if (score < 40) return "bg-red-500 text-white"
    if (score < 60) return "bg-orange-500 text-white"
    if (score < 75) return "bg-yellow-500 text-black"
    if (score < 90) return "bg-green-500 text-white"
    return "bg-emerald-600 text-white"
  }

  const sizeClasses = {
    sm: "h-5 w-5 text-xs",
    md: "h-7 w-7 text-sm",
    lg: "h-10 w-10 text-base",
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold",
          getScoreColor(score),
          sizeClasses[size],
        )}
      >
        {score}
      </div>
      {showText && <span className="text-sm text-muted-foreground">Sustainability Score</span>}
    </div>
  )
}
