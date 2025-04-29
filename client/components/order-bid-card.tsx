"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface OrderBidCardProps {
  order: {
    id: string
    name: string
    user: string
    specs: string
    created: string
    status: string
    hasBid: boolean
    bidAmount?: string
  }
}

export function OrderBidCard({ order }: OrderBidCardProps) {
  const router = useRouter()
  const [bidAmount, setBidAmount] = useState("")
  const [showBidForm, setShowBidForm] = useState(false)

  const handleBid = (e) => {
    e.preventDefault()
    // In a real app, this would call an API to place a bid
    console.log("Placing bid:", { orderId: order.id, amount: bidAmount })
    setShowBidForm(false)
    // Refresh the page or update the UI
  }

  const viewOrder = () => {
    router.push(`/orderbook/${order.id}`)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{order.name}</CardTitle>
            <CardDescription>
              Created by {order.user} on {order.created}
            </CardDescription>
          </div>
          <Badge variant={order.status === "Open" ? "outline" : "default"}>{order.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-2">
          <div className="text-sm">
            <span className="font-medium">Specs:</span> {order.specs}
          </div>
          {order.hasBid && (
            <div className="text-sm">
              <span className="font-medium">Your Bid:</span> {order.bidAmount}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        {showBidForm ? (
          <form onSubmit={handleBid} className="flex w-full gap-2">
            <Input
              type="text"
              placeholder="XLM/hour (e.g., 0.025)"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              required
            />
            <Button type="submit" size="sm">
              Submit
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowBidForm(false)}>
              Cancel
            </Button>
          </form>
        ) : (
          <>
            <Button variant={order.hasBid ? "outline" : "default"} size="sm" onClick={() => setShowBidForm(true)}>
              {order.hasBid ? "Update Bid" : "Place Bid"}
            </Button>
            <Button variant="ghost" size="sm" onClick={viewOrder}>
              View Details
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
