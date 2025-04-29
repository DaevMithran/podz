import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface OrderCardProps {
  order: {
    id: string
    name: string
    specs: string
    created: string
    bids: number
    status: string
  }
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{order.name}</CardTitle>
        <CardDescription>Created on {order.created}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-2">
          <div className="text-sm">
            <span className="font-medium">Specs:</span> {order.specs}
          </div>
          <div className="text-sm">
            <span className="font-medium">Bids:</span> {order.bids}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Badge variant={order.status === "Bidding" ? "outline" : "default"}>{order.status}</Badge>
        <Link href={`/orderbook/${order.id}`}>
          <Button size="sm">View Bids</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
