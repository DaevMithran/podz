"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface OrderItemProps {
  order: {
    id: string
    name: string
    specs: string
    created: string
    bids: number
    status: string
    user?: string
  }
  isProvider: boolean
}

export function OrderItem({ order, isProvider }: OrderItemProps) {
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
              {order.user ? `Created by ${order.user} on ${order.created}` : `Created on ${order.created}`}
            </CardDescription>
          </div>
          <Badge variant={order.status === "Bidding" ? "outline" : "default"}>{order.status}</Badge>
        </div>
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
        {isProvider ? (
          showBidForm ? (
            <form onSubmit={handleBid} className="flex w-full gap-2">
              <input
                type="text"
                placeholder="XLM/hour (e.g., 0.025)"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
              <Button variant="outline" size="sm" onClick={() => setShowBidForm(true)}>
                Place Bid
              </Button>
              <Button variant="ghost" size="sm" onClick={viewOrder}>
                View Details
              </Button>
            </>
          )
        ) : (
          <>
            <Link href={`/orderbook/${order.id}`}>
              <Button size="sm">View Bids</Button>
            </Link>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
