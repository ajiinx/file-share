import { useState, useEffect } from "react"

export function useCountdown(expiryTime?: string) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  if (!expiryTime) {
    return "Checking..."
  }

  const distance = new Date(expiryTime).getTime() - now
  if (distance <= 0) {
    return "Expired"
  }

  const totalSeconds = Math.floor(distance / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }

  return `${seconds}s`
}
