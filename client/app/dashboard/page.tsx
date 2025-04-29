"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { useState } from "react"
import Link from "next/link"
import { Activity, ArrowUpDown, Clock, Cloud, CreditCard, Plus, Server, Zap } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function DashboardPage() {
  const [activeDeployments, setActiveDeployments] = useState([
    {
      id: "dep-1",
      name: "Web Server",
      provider: "CloudNode Alpha",
      status: "Running",
      specs: "2 CPU, 4GB RAM, 50GB SSD",
      image: "nginx:latest",
      uptime: "3d 5h 12m",
      cost: "0.015 XLM/hour",
      cpuUsage: 42,
      memoryUsage: 28,
      networkUsage: 65,
    },
    {
      id: "dep-2",
      name: "Database Cluster",
      provider: "Compute Guild",
      status: "Running",
      specs: "4 CPU, 16GB RAM, 100GB SSD",
      image: "postgres:14",
      uptime: "1d 12h 45m",
      cost: "0.045 XLM/hour",
      cpuUsage: 78,
      memoryUsage: 62,
      networkUsage: 35,
    },
  ])

  const [pendingOrders, setPendingOrders] = useState([
    {
      id: "order-1",
      name: "ML Training Node",
      specs: "8 CPU, 32GB RAM, 1 GPU, 200GB SSD",
      created: "2023-06-15",
      bids: 3,
      status: "Bidding",
    },
    {
      id: "order-2",
      name: "API Server",
      specs: "2 CPU, 8GB RAM, 100GB SSD",
      created: "2023-06-14",
      bids: 5,
      status: "Bidding",
    },
  ])

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Manage your deployments and orders."
        action={
          <Link href="/dashboard/create-order">
            <Button className="gap-1 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Create Order
            </Button>
          </Link>
        }
      />
      <div className="grid gap-4 md:gap-8">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">245.75 XLM</div>
              <p className="text-xs text-blue-600">+12% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
              <Cloud className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{activeDeployments.length}</div>
              <p className="text-xs text-green-600">+1 from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{pendingOrders.length}</div>
              <p className="text-xs text-purple-600">-1 from last week</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resource Usage</CardTitle>
              <Activity className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700">68%</div>
              <p className="text-xs text-amber-600">+8% from last week</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="deployments" className="space-y-4">
          <TabsList className="bg-blue-50 text-blue-900">
            <TabsTrigger value="deployments" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Active Deployments
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Pending Orders
            </TabsTrigger>
          </TabsList>
          <TabsContent value="deployments" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {activeDeployments.map((deployment) => (
                <Card key={deployment.id} className="overflow-hidden border-blue-100">
                  <div className="h-1 bg-blue-600"></div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{deployment.name}</CardTitle>
                        <CardDescription>{deployment.provider}</CardDescription>
                      </div>
                      <div className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {deployment.status}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid gap-3">
                      <div className="text-sm">
                        <span className="font-medium">Specs:</span> {deployment.specs}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Image:</span> {deployment.image}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Uptime:</span> {deployment.uptime}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Cost:</span> {deployment.cost}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>CPU</span>
                          <span>{deployment.cpuUsage}%</span>
                        </div>
                        <Progress value={deployment.cpuUsage} className="h-1" indicatorClassName="bg-blue-600" />

                        <div className="flex items-center justify-between text-xs">
                          <span>Memory</span>
                          <span>{deployment.memoryUsage}%</span>
                        </div>
                        <Progress value={deployment.memoryUsage} className="h-1" indicatorClassName="bg-green-600" />

                        <div className="flex items-center justify-between text-xs">
                          <span>Network</span>
                          <span>{deployment.networkUsage}%</span>
                        </div>
                        <Progress value={deployment.networkUsage} className="h-1" indicatorClassName="bg-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-6 py-3 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Console</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Metrics</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            {activeDeployments.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>No Active Deployments</CardTitle>
                  <CardDescription>You don't have any active deployments yet.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/create-order">
                    <Button className="bg-blue-600 hover:bg-blue-700">Create Your First Order</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="orders" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {pendingOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden border-purple-100">
                  <div className="h-1 bg-purple-600"></div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle>{order.name}</CardTitle>
                      <div className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {order.status}
                      </div>
                    </div>
                    <CardDescription>Created on {order.created}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid gap-2">
                      <div className="text-sm">
                        <span className="font-medium">Specs:</span> {order.specs}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-purple-50 rounded-full flex items-center gap-1">
                          <Zap className="h-3.5 w-3.5 text-purple-600" />
                          <span className="text-xs font-medium text-purple-600">{order.bids} Bids</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-6 py-3 bg-gray-50">
                    <Link href={`/orderbook/${order.id}`}>
                      <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                        View Bids
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
            {pendingOrders.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>No Pending Orders</CardTitle>
                  <CardDescription>You don't have any pending orders.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/create-order">
                    <Button className="bg-blue-600 hover:bg-blue-700">Create an Order</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
