import { cn } from "@/lib/utils"

interface AQIBadgeProps {
  aqi: number
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function AQIBadge({ aqi, size = "md", showText = true, className }: AQIBadgeProps) {
  const getAQIColor = (aqi: number) => {
    if (aqi < 50) return "bg-green-500"
    if (aqi < 100) return "bg-yellow-500"
    if (aqi < 150) return "bg-orange-500"
    if (aqi < 200) return "bg-red-500"
    if (aqi < 300) return "bg-purple-500"
    return "bg-rose-900"
  }

  const getAQIText = (aqi: number) => {
    if (aqi < 50) return "Good"
    if (aqi < 100) return "Moderate"
    if (aqi < 150) return "Unhealthy for Sensitive Groups"
    if (aqi < 200) return "Unhealthy"
    if (aqi < 300) return "Very Unhealthy"
    return "Hazardous"
  }

  const sizeClasses = {
    sm: "h-2 text-xs",
    md: "h-3 text-sm",
    lg: "h-4 text-base",
  }

  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn("rounded-full", getAQIColor(aqi), sizeClasses[size])}
          style={{ width: `${Math.min((aqi / 500) * 100, 100)}%` }}
        ></div>
      </div>
      {showText && (
        <div className="flex justify-between text-xs">
          <span className="font-medium">AQI: {aqi}</span>
          <span className="text-muted-foreground">{getAQIText(aqi)}</span>
        </div>
      )}
    </div>
  )
}
