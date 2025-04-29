"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ProviderCard } from "@/components/provider-card"
import { useState } from "react"
import { Search, Server, Users, Globe, Award, Activity } from "lucide-react"
import Link from "next/link"

export default function ProvidersPage() {
  const [providers, setProviders] = useState([
    {
      id: "provider-1",
      name: "CloudNode Alpha",
      description: "High-performance compute nodes with global distribution",
      rating: 4.8,
      completedOrders: 156,
      activeOrders: 23,
      location: "North America",
      specs: "Up to 64 CPU cores, 256GB RAM, 8 GPUs",
      availability: "99.9%",
    },
    {
      id: "provider-2",
      name: "Compute Guild",
      description: "Community-driven compute provider with competitive pricing",
      rating: 4.6,
      completedOrders: 89,
      activeOrders: 12,
      location: "Europe",
      specs: "Up to 32 CPU cores, 128GB RAM, 4 GPUs",
      availability: "99.5%",
    },
    {
      id: "provider-3",
      name: "DeCloud Node",
      description: "Enterprise-grade infrastructure for demanding workloads",
      rating: 4.9,
      completedOrders: 213,
      activeOrders: 45,
      location: "Asia",
      specs: "Up to 128 CPU cores, 512GB RAM, 16 GPUs",
      availability: "99.95%",
    },
    {
      id: "provider-4",
      name: "Stellar Compute",
      description: "Specialized in ML and AI workloads with optimized hardware",
      rating: 4.7,
      completedOrders: 78,
      activeOrders: 15,
      location: "Global",
      specs: "Up to 64 CPU cores, 256GB RAM, 8 GPUs (A100)",
      availability: "99.8%",
    },
    {
      id: "provider-5",
      name: "Decentralized Systems",
      description: "Eco-friendly compute resources with renewable energy",
      rating: 4.5,
      completedOrders: 42,
      activeOrders: 8,
      location: "Europe",
      specs: "Up to 16 CPU cores, 64GB RAM, 2 GPUs",
      availability: "99.7%",
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")

  const filteredProviders = providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate marketplace stats
  const totalProviders = providers.length
  const totalCompletedOrders = providers.reduce((sum, provider) => sum + provider.completedOrders, 0)
  const totalActiveOrders = providers.reduce((sum, provider) => sum + provider.activeOrders, 0)
  const averageRating = (providers.reduce((sum, provider) => sum + provider.rating, 0) / providers.length).toFixed(1)
  const regions = [...new Set(providers.map((provider) => provider.location))].length

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
            <Link href="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700">Launch Console</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Providers</h1>
              <p className="text-muted-foreground">Browse and connect with compute providers in the marketplace.</p>
            </div>
            <Link href="/providers/register">
              <Button className="bg-blue-600 hover:bg-blue-700">Become a Provider</Button>
            </Link>
          </div>

          {/* Stats Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <Server className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-blue-700">{totalProviders}</h3>
                  <p className="text-sm text-muted-foreground">Active Providers</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-green-700">{totalActiveOrders}</h3>
                  <p className="text-sm text-muted-foreground">Active Orders</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                    <Award className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-amber-700">{totalCompletedOrders}</h3>
                  <p className="text-sm text-muted-foreground">Completed Orders</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                    <Globe className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-purple-700">{regions}</h3>
                  <p className="text-sm text-muted-foreground">Global Regions</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex items-center">
                    <h3 className="text-3xl font-bold text-blue-700">{averageRating}</h3>
                    <span className="text-yellow-500 ml-1">★</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search providers by name, description, or location..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {filteredProviders.length > 0 ? (
                filteredProviders.map((provider) => <ProviderCard key={provider.id} provider={provider} />)
              ) : (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>No Providers Found</CardTitle>
                    <CardDescription>
                      No providers match your search criteria. Try adjusting your search.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
