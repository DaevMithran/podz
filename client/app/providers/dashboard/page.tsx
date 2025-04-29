"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, Check, ChevronDown, Filter, Search, Server, Wallet } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ProviderResourceChart } from "@/components/provider-resource-chart"

export default function ProviderDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("active-leases")

  // Mock data for resource usage
  const resourceData = {
    cpu: {
      used: 5561,
      total: 21241,
      usedPercentage: 26,
      segments: [
        { value: 26, color: "#ff4d4f" },
        { value: 74, color: "#8c8c8c" },
      ],
      details: [
        { label: "5.56K CPU", value: 5561, color: "#ff4d4f" },
        { label: "15.68K CPU", value: 15680, color: "#8c8c8c" },
      ],
    },
    gpu: {
      used: 406,
      total: 780,
      usedPercentage: 52,
      segments: [
        { value: 52, color: "#ff4d4f" },
        { value: 48, color: "#8c8c8c" },
      ],
      details: [
        { label: "406 GPU", value: 406, color: "#ff4d4f" },
        { label: "374 GPU", value: 374, color: "#8c8c8c" },
      ],
    },
    storage: {
      used: 22.4,
      total: 144.36,
      usedPercentage: 15,
      segments: [
        { value: 15, color: "#ff4d4f" },
        { value: 85, color: "#8c8c8c" },
      ],
      details: [
        { label: "22.4 TB", value: 22.4, color: "#ff4d4f" },
        { label: "121.96 TB", value: 121.96, color: "#8c8c8c" },
      ],
    },
    memory: {
      used: 83.85,
      total: 1350,
      usedPercentage: 6,
      segments: [
        { value: 6, color: "#ff4d4f" },
        { value: 30, color: "#d9d9d9" },
        { value: 64, color: "#8c8c8c" },
      ],
      details: [
        { label: "83.85 TB", value: 83.85, color: "#ff4d4f" },
        { label: "400.77 TB", value: 400.77, color: "#d9d9d9" },
        { label: "877.1 TB", value: 877.1, color: "#8c8c8c" },
      ],
    },
  }

  // Mock data for active leases
  const [activeLeases, setActiveLeases] = useState([
    {
      id: "lease-1",
      name: "Web Server",
      user: "alice.stellar",
      specs: "2 CPU, 4GB RAM, 50GB SSD",
      image: "nginx:latest",
      uptime: "3d 5h 12m",
      earnings: "0.015 XLM/hour",
      status: "Running",
    },
    {
      id: "lease-2",
      name: "Database Cluster",
      user: "bob.stellar",
      specs: "4 CPU, 16GB RAM, 100GB SSD",
      image: "postgres:14",
      uptime: "1d 12h 45m",
      earnings: "0.045 XLM/hour",
      status: "Running",
    },
  ])

  // Mock data for providers
  const providers = [
    {
      name: "prov_d3akash.cloud",
      location: "BE, CH",
      uptime: "99.96%",
      activeLeases: 66,
      cpu: "78/91",
      gpu: "1/1",
      memory: "172GB/340GB",
      disk: "838GB/7TB",
      audited: true,
    },
    {
      name: "prov_ashprovid.com",
      location: "TX, US",
      uptime: "97.6%",
      activeLeases: 40,
      cpu: "136/208",
      gpu: "4/6",
      memory: "296GB/512GB",
      disk: "1TB/6TB",
      audited: true,
    },
    {
      name: "prov_val.akash.pub",
      location: "CA, US",
      uptime: "99.97%",
      activeLeases: 36,
      cpu: "458/1333",
      gpu: "46/56",
      memory: "3TB/15TB",
      disk: "15TB/47TB",
      audited: true,
    },
    {
      name: "prov_h-palmito.org",
      location: "FL, US",
      uptime: "99.84%",
      activeLeases: 35,
      cpu: "124/260",
      gpu: "0/1",
      memory: "193GB/437GB",
      disk: "1TB/9TB",
      audited: true,
    },
    {
      name: "prov_dal.leet.haus",
      location: "TX, US",
      uptime: "100%",
      activeLeases: 35,
      cpu: "156/577",
      gpu: "0/0",
      memory: "196GB/3TB",
      disk: "451GB/54TB",
      audited: true,
    },
  ]

  // Filter providers based on search query
  const filteredProviders = providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
            <Button className="bg-blue-600 hover:bg-blue-700">Become a Provider</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Provider Dashboard</h1>
              <p className="text-muted-foreground">Manage your compute resources and monitor active leases.</p>
            </div>
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="leases">Active Leases</TabsTrigger>
              <TabsTrigger value="providers">Providers</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">342.88 XLM</div>
                    <p className="text-xs text-muted-foreground">+18% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Leases</CardTitle>
                    <Server className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeLeases.length}</div>
                    <p className="text-xs text-muted-foreground">+1 from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">CPU Utilization</CardTitle>
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{resourceData.cpu.usedPercentage}%</div>
                    <p className="text-xs text-muted-foreground">
                      {resourceData.cpu.used} / {resourceData.cpu.total} CPU units
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">GPU Utilization</CardTitle>
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{resourceData.gpu.usedPercentage}%</div>
                    <p className="text-xs text-muted-foreground">
                      {resourceData.gpu.used} / {resourceData.gpu.total} GPU units
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Utilization</CardTitle>
                    <CardDescription>Overview of your compute resources</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">CPU</div>
                      <ProviderResourceChart data={resourceData.cpu} />
                      <div className="text-xs text-center text-muted-foreground">
                        {resourceData.cpu.used} / {resourceData.cpu.total} CPU
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">GPU</div>
                      <ProviderResourceChart data={resourceData.gpu} />
                      <div className="text-xs text-center text-muted-foreground">
                        {resourceData.gpu.used} / {resourceData.gpu.total} GPU
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Storage</div>
                      <ProviderResourceChart data={resourceData.storage} />
                      <div className="text-xs text-center text-muted-foreground">
                        {resourceData.storage.used} / {resourceData.storage.total} TB
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Memory</div>
                      <ProviderResourceChart data={resourceData.memory} />
                      <div className="text-xs text-center text-muted-foreground">
                        {resourceData.memory.used} / {resourceData.memory.total} TB
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest events from your providers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-sm">New lease accepted</span>
                        </div>
                        <span className="text-xs text-muted-foreground">2 hours ago</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Lease for "Web Server" from alice.stellar was accepted
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <span className="text-sm">Payment received</span>
                        </div>
                        <span className="text-xs text-muted-foreground">5 hours ago</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Payment of 12.5 XLM received for "Database Cluster"
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                          <span className="text-sm">Resource warning</span>
                        </div>
                        <span className="text-xs text-muted-foreground">1 day ago</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        GPU utilization reached 80% on provider prov_val.akash.pub
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-sm">Audit completed</span>
                        </div>
                        <span className="text-xs text-muted-foreground">2 days ago</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Provider prov_d3akash.cloud passed security audit</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="leases" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 md:max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search leases..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-1">
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>All Leases</DropdownMenuItem>
                      <DropdownMenuItem>Running</DropdownMenuItem>
                      <DropdownMenuItem>Pending</DropdownMenuItem>
                      <DropdownMenuItem>Terminated</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid gap-4">
                {activeLeases.map((lease) => (
                  <Card key={lease.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{lease.name}</h3>
                            <Badge variant={lease.status === "Running" ? "default" : "outline"}>{lease.status}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">Leased by {lease.user}</div>
                          <div className="text-sm">{lease.specs}</div>
                          <div className="text-sm">
                            <span className="font-medium">Image:</span> {lease.image}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="flex flex-col items-center px-4 py-2 bg-gray-50 rounded-md">
                            <span className="text-sm text-muted-foreground">Uptime</span>
                            <span className="font-medium">{lease.uptime}</span>
                          </div>
                          <div className="flex flex-col items-center px-4 py-2 bg-gray-50 rounded-md">
                            <span className="text-sm text-muted-foreground">Earnings</span>
                            <span className="font-medium">{lease.earnings}</span>
                          </div>
                          <Button variant="outline">View Details</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="providers" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 md:max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search providers..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active-leases">Active Leases (desc)</SelectItem>
                        <SelectItem value="uptime">Uptime</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border rounded-md">
                <div className="grid grid-cols-8 gap-2 p-4 bg-gray-50 border-b text-sm font-medium">
                  <div className="col-span-2">Name</div>
                  <div>Location</div>
                  <div>Uptime</div>
                  <div>Leases</div>
                  <div>CPU</div>
                  <div>GPU</div>
                  <div>Audited</div>
                </div>
                {filteredProviders.map((provider, index) => (
                  <div
                    key={provider.name}
                    className={`grid grid-cols-8 gap-2 p-4 text-sm ${
                      index !== filteredProviders.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <div className="col-span-2 font-medium">{provider.name}</div>
                    <div>{provider.location}</div>
                    <div>{provider.uptime}</div>
                    <div>{provider.activeLeases}</div>
                    <div>{provider.cpu}</div>
                    <div>{provider.gpu}</div>
                    <div>
                      {provider.audited ? (
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="ml-1">Yes</span>
                        </div>
                      ) : (
                        "No"
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
