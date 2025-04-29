"use client"

import { useEffect, useRef } from "react"

interface ChartSegment {
  value: number
  color: string
}

interface ChartDetail {
  label: string
  value: number
  color: string
}

interface ProviderResourceChartProps {
  data: {
    segments: ChartSegment[]
    details: ChartDetail[]
  }
}

export function ProviderResourceChart({ data }: ProviderResourceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const size = canvas.width
    const centerX = size / 2
    const centerY = size / 2
    const radius = size * 0.4
    const innerRadius = size * 0.2

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw segments
    let startAngle = -0.5 * Math.PI // Start at the top
    data.segments.forEach((segment) => {
      const endAngle = startAngle + (segment.value / 100) * 2 * Math.PI

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = segment.color
      ctx.fill()

      startAngle = endAngle
    })

    // Draw inner circle (white)
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadius - 1, 0, 2 * Math.PI)
    ctx.fillStyle = "white"
    ctx.fill()
  }, [data])

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={100} height={100} className="w-24 h-24" />
    </div>
  )
}
