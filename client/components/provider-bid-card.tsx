"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Star } from "lucide-react"

interface ProviderBidCardProps {
  bid: {
    id: string
    provider: {
      id: string
      name: string
      rating: number
      completedOrders: number
    }
    price: string
    totalPrice: string
    estimatedDeployTime: string
    availability: string
    location: string
  }
  isSelected: boolean
  onSelect: () => void
}

export function ProviderBidCard({ bid, isSelected, onSelect }: ProviderBidCardProps) {
  return (
    <Card className={`border-2 transition-all ${isSelected ? "border-primary" : "border-border"}`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{bid.provider.name}</h3>
              {isSelected && <Badge>Selected</Badge>}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span>
                {bid.provider.rating} ({bid.provider.completedOrders} orders)
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{bid.location}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-lg font-bold">{bid.price}</div>
            <div className="text-sm text-muted-foreground">{bid.totalPrice}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Deploy in {bid.estimatedDeployTime}</span>
            </div>
          </div>

          <div>
            <Button variant={isSelected ? "default" : "outline"} onClick={onSelect}>
              {isSelected ? "Selected" : "Select"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
