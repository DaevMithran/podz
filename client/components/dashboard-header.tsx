import type React from "react"

interface DashboardHeaderProps {
  heading: string
  text?: string
  action?: React.ReactNode
}

export function DashboardHeader({ heading, text, action }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="font-heading text-3xl md:text-4xl">{heading}</h1>
        {text && <p className="text-lg text-muted-foreground">{text}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}
