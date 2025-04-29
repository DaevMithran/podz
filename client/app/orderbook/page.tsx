"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, ArrowUpDown, ChevronDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

export default function OrderbookPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [pollingInterval, setPollingInterval] = useState(15000) // 15 seconds
  const { toast } = useToast()

  // Function to fetch orders from the blockchain
  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would call an API to fetch orders from the blockchain
      // For now, we'll simulate a fetch with mock data
      const mockOrders = [
        {
          id: "order-1",
          name: "ML Training Node",
          user: "alice.stellar",
          specs: "8 CPU, 32GB RAM, 1 GPU, 200GB SSD",
          created: "2023-06-15",
          bids: 3,
          status: "Bidding",
          isMyOrder: false,
        },
        {
          id: "order-2",
          name: "API Server",
          user: "bob.stellar",
          specs: "2 CPU, 8GB RAM, 100GB SSD",
          created: "2023-06-14",
          bids: 5,
          status: "Bidding",
          isMyOrder: true,
        },
        {
          id: "order-3",
          name: "Database Cluster",
          user: "charlie.stellar",
          specs: "4 CPU, 16GB RAM, 500GB SSD",
          created: "2023-06-13",
          bids: 2,
          status: "Bidding",
          isMyOrder: false,
        },
        {
          id: "order-4",
          name: "Web Server",
          user: "dave.stellar",
          specs: "2 CPU, 4GB RAM, 50GB SSD",
          created: "2023-06-12",
          bids: 7,
          status: "Bidding",
          isMyOrder: false,
        },
        {
          id: "order-5",
          name: "Video Transcoding",
          user: "eve.stellar",
          specs: "16 CPU, 64GB RAM, 2 GPU, 1TB SSD",
          created: "2023-06-11",
          bids: 1,
          status: "Bidding",
          isMyOrder: true,
        },
      ]

      // Check for new orders in localStorage (simulating orders created by the user)
      const localOrders = JSON.parse(localStorage.getItem("createdOrders") || "[]")
      const combinedOrders = [...mockOrders, ...localOrders]

      setOrders(combinedOrders)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error fetching orders",
        description: "Could not fetch orders from the blockchain. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchOrders()
  }, [])

  // Set up polling
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchOrders()
    }, pollingInterval)

    return () => clearInterval(intervalId)
  }, [pollingInterval])

  // Filter orders based on search query and active tab
  const filteredOrders = orders.filter((order) => {
    // Filter by search query
    const matchesSearch =
      order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.specs.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by tab
    if (activeTab === "my-orders") {
      return matchesSearch && order.isMyOrder
    }

    return matchesSearch
  })

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
            <Link href="/create">
              <Button className="bg-blue-600 hover:bg-blue-700">Create Project</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Orderbook</h1>
              <p className="text-muted-foreground">
                Browse and manage compute orders from the decentralized marketplace.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Filter by CPU</DropdownMenuItem>
                  <DropdownMenuItem>Filter by RAM</DropdownMenuItem>
                  <DropdownMenuItem>Filter by GPU</DropdownMenuItem>
                  <DropdownMenuItem>Filter by Storage</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    <ArrowUpDown className="h-4 w-4" />
                    <span>Sort</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Newest First</DropdownMenuItem>
                  <DropdownMenuItem>Oldest First</DropdownMenuItem>
                  <DropdownMenuItem>Most Bids</DropdownMenuItem>
                  <DropdownMenuItem>Fewest Bids</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="icon" onClick={fetchOrders} disabled={isLoading} title="Refresh orders">
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Orders</div>
              <div className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</div>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  All Orders
                </TabsTrigger>
                <TabsTrigger
                  value="my-orders"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  My Orders
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-4">
                {filteredOrders.length > 0 ? (
                  <div className="grid gap-4">
                    {filteredOrders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Orders Found</CardTitle>
                      <CardDescription>
                        No orders match your search criteria. Try adjusting your search or create a new order.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/create">
                        <Button className="bg-blue-600 hover:bg-blue-700">Create New Project</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="my-orders" className="space-y-4 mt-4">
                {filteredOrders.length > 0 ? (
                  <div className="grid gap-4">
                    {filteredOrders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Orders</CardTitle>
                      <CardDescription>You haven't created any orders yet.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/create">
                        <Button className="bg-blue-600 hover:bg-blue-700">Create Your First Project</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

function OrderCard({ order }) {
  return (
    <Card className="overflow-hidden border-blue-100">
      <div className={`h-1 ${order.isMyOrder ? "bg-green-600" : "bg-blue-600"}`}></div>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{order.name}</h3>
              {order.isMyOrder && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  My Order
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Created by {order.user} on {order.created}
            </div>
            <div className="text-sm">{order.specs}</div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex flex-col items-center px-4 py-2 bg-gray-50 rounded-md">
              <span className="text-sm text-muted-foreground">Bids</span>
              <span className="font-bold">{order.bids}</span>
            </div>

            <Link href={`/orderbook/${order.id}`}>
              <Button className="bg-blue-600 hover:bg-blue-700">{order.isMyOrder ? "View Bids" : "Place Bid"}</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
