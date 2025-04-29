"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Clock, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function OrderDetailPage({ params }) {
  const router = useRouter()
  const { id } = params

  // Mock data for the order
  const order = {
    id,
    name: "ML Training Node",
    user: "alice.stellar",
    specs: {
      cpu: 8,
      ram: 32,
      storage: 200,
      gpu: {
        units: 1,
        type: "nvidia-t4",
      },
    },
    created: "2023-06-15",
    status: "Bidding",
    isMyOrder: true,
  }

  // Mock data for bids
  const bids = [
    {
      id: "bid-1",
      provider: {
        id: "provider-1",
        name: "CloudNode Alpha",
        rating: 4.8,
        completedOrders: 156,
      },
      price: "0.035 XLM/hour",
      totalPrice: "25.2 XLM/month",
      estimatedDeployTime: "< 1 minute",
      availability: "99.9%",
      location: "North America",
      tier: "Premium",
    },
    {
      id: "bid-2",
      provider: {
        id: "provider-2",
        name: "Compute Guild",
        rating: 4.6,
        completedOrders: 89,
      },
      price: "0.032 XLM/hour",
      totalPrice: "23.04 XLM/month",
      estimatedDeployTime: "2 minutes",
      availability: "99.5%",
      location: "Europe",
      tier: "Standard",
    },
    {
      id: "bid-3",
      provider: {
        id: "provider-3",
        name: "DeCloud Node",
        rating: 4.9,
        completedOrders: 213,
      },
      price: "0.038 XLM/hour",
      totalPrice: "27.36 XLM/month",
      estimatedDeployTime: "< 1 minute",
      availability: "99.95%",
      location: "Asia",
      tier: "Premium",
    },
  ]

  const [selectedBid, setSelectedBid] = useState(null)
  const [activeTab, setActiveTab] = useState("bids")

  const handleSelectProvider = (bidId) => {
    setSelectedBid(bidId)
  }

  const handleDeploy = () => {
    if (selectedBid) {
      router.push(`/deploy?order=${id}&bid=${selectedBid}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <span className="text-xs font-bold">D</span>
            </div>
            <span className="text-blue-600">DeCloud Market</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/orderbook" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back to Orderbook
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">{order.name}</h1>
            <p className="text-muted-foreground">
              Created by {order.user} on {order.created}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                  <CardDescription>Specifications for this compute order</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">CPU</div>
                      <Badge variant="outline">{order.specs.cpu} Units</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Memory</div>
                      <Badge variant="outline">{order.specs.ram} GB</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Storage</div>
                      <Badge variant="outline">{order.specs.storage} GB</Badge>
                    </div>
                    {order.specs.gpu.units > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm">GPU</div>
                        <Badge variant="outline">
                          {order.specs.gpu.units} × {order.specs.gpu.type}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Badge className="w-full justify-center py-1">{order.status}</Badge>
                </CardFooter>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Provider Bids</CardTitle>
                  <CardDescription>Select a provider to deploy your container</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid grid-cols-2">
                      <TabsTrigger value="bids">Bids ({bids.length})</TabsTrigger>
                      <TabsTrigger value="compare">Compare</TabsTrigger>
                    </TabsList>

                    <TabsContent value="bids" className="space-y-4">
                      {bids.map((bid) => (
                        <div
                          key={bid.id}
                          className={`border rounded-lg p-4 transition-all ${selectedBid === bid.id ? "border-blue-600 bg-blue-50" : "hover:border-gray-400"}`}
                          onClick={() => handleSelectProvider(bid.id)}
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{bid.provider.name}</h3>
                                <Badge variant="outline">{bid.tier}</Badge>
                                {selectedBid === bid.id && <Badge className="bg-blue-600">Selected</Badge>}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                <span>
                                  {bid.provider.rating} ({bid.provider.completedOrders} orders)
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>{bid.location}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Deploy in {bid.estimatedDeployTime}</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end">
                              <div className="text-lg font-bold">{bid.price}</div>
                              <div className="text-sm text-muted-foreground">{bid.totalPrice}</div>
                              <div className="mt-2">
                                <Button
                                  variant={selectedBid === bid.id ? "default" : "outline"}
                                  className={selectedBid === bid.id ? "bg-blue-600 hover:bg-blue-700" : ""}
                                  onClick={() => handleSelectProvider(bid.id)}
                                >
                                  {selectedBid === bid.id ? (
                                    <span className="flex items-center gap-1">
                                      <Check className="h-4 w-4" /> Selected
                                    </span>
                                  ) : (
                                    "Select"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="compare" className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Provider</th>
                              <th className="text-left p-2">Price</th>
                              <th className="text-left p-2">Rating</th>
                              <th className="text-left p-2">Location</th>
                              <th className="text-left p-2">Tier</th>
                              <th className="text-left p-2">Availability</th>
                              <th className="text-left p-2"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {bids.map((bid) => (
                              <tr key={bid.id} className="border-b hover:bg-gray-50">
                                <td className="p-2 font-medium">{bid.provider.name}</td>
                                <td className="p-2">{bid.price}</td>
                                <td className="p-2">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                    {bid.provider.rating}
                                  </div>
                                </td>
                                <td className="p-2">{bid.location}</td>
                                <td className="p-2">{bid.tier}</td>
                                <td className="p-2">{bid.availability}</td>
                                <td className="p-2">
                                  <Button
                                    variant={selectedBid === bid.id ? "default" : "outline"}
                                    size="sm"
                                    className={selectedBid === bid.id ? "bg-blue-600 hover:bg-blue-700" : ""}
                                    onClick={() => handleSelectProvider(bid.id)}
                                  >
                                    {selectedBid === bid.id ? "Selected" : "Select"}
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!selectedBid}
                    onClick={handleDeploy}
                  >
                    Continue to Deployment
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
