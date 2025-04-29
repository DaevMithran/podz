import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Server, Star } from "lucide-react"
import Link from "next/link"

interface ProviderCardProps {
  provider: {
    id: string
    name: string
    description: string
    rating: number
    completedOrders: number
    activeOrders: number
    location: string
    specs: string
    availability: string
  }
}

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{provider.name}</CardTitle>
            <CardDescription>{provider.description}</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-medium">{provider.rating}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-2">
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{provider.location}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Server className="h-4 w-4 text-muted-foreground" />
            <span>{provider.specs}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Completed Orders</span>
              <span className="font-medium">{provider.completedOrders}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Active Orders</span>
              <span className="font-medium">{provider.activeOrders}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Availability</span>
              <span className="font-medium">{provider.availability}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={`/providers/${provider.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Provider
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
