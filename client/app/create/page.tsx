"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Cloud, Database, Network, Server, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export default function CreateProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [projectName, setProjectName] = useState("")
  const [activeTab, setActiveTab] = useState("compute")
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedTier, setSelectedTier] = useState("basic")
  const [maxPrice, setMaxPrice] = useState("50")

  // Compute settings
  const [cpuUnits, setCpuUnits] = useState(2)
  const [ramGB, setRamGB] = useState(4)
  const [storageGB, setStorageGB] = useState(50)

  // GPU settings
  const [gpuEnabled, setGpuEnabled] = useState(false)
  const [gpuUnits, setGpuUnits] = useState(1)
  const [gpuType, setGpuType] = useState("")

  // Database settings
  const [dbEnabled, setDbEnabled] = useState(false)
  const [dbEngine, setDbEngine] = useState("")
  const [dbVersion, setDbVersion] = useState("")

  // Estimated cost calculation
  const calculateEstimatedCost = () => {
    let baseCost = 0

    // Compute costs
    if (selectedTier === "basic") {
      baseCost += cpuUnits * 5 + ramGB * 2 + storageGB * 0.1
    } else if (selectedTier === "general") {
      baseCost += cpuUnits * 8 + ramGB * 3 + storageGB * 0.15
    } else if (selectedTier === "premium") {
      baseCost += cpuUnits * 12 + ramGB * 4 + storageGB * 0.2
    }

    // GPU costs if enabled
    if (gpuEnabled) {
      if (gpuType === "nvidia-t4") {
        baseCost += gpuUnits * 50
      } else if (gpuType === "nvidia-a100") {
        baseCost += gpuUnits * 120
      } else {
        baseCost += gpuUnits * 80
      }
    }

    // Database costs if enabled
    if (dbEnabled) {
      baseCost += 20
    }

    return baseCost.toFixed(2)
  }

  const handleCreateProject = () => {
    // Create a new order object
    const newOrder = {
      id: `order-${Date.now()}`,
      name: projectName,
      user: "current.user",
      specs: `${cpuUnits} CPU, ${ramGB}GB RAM${gpuEnabled ? `, ${gpuUnits} ${gpuType}` : ""}, ${storageGB}GB SSD`,
      created: new Date().toISOString().split("T")[0],
      bids: 0,
      status: "Bidding",
      isMyOrder: true,
      maxPrice: maxPrice,
    }

    // Store the order in localStorage (simulating blockchain storage)
    const existingOrders = JSON.parse(localStorage.getItem("createdOrders") || "[]")
    existingOrders.push(newOrder)
    localStorage.setItem("createdOrders", JSON.stringify(existingOrders))

    // Show success toast
    toast({
      title: "Project created successfully",
      description: "Your order has been added to the orderbook.",
      variant: "default",
    })

    // Navigate to the orderbook
    router.push("/orderbook")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Cloud className="h-6 w-6 text-blue-600" />
            <span className="text-blue-600">DeCloud Market</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateProject} disabled={!projectName}>
              Create Project
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4 md:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Create a New Project</h1>
              <p className="text-muted-foreground">
                Configure your compute resources and deploy to the decentralized network.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Name your project and select a region</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    placeholder="My Awesome Project"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Select Region</Label>
                  <RadioGroup defaultValue={selectedRegion} onValueChange={setSelectedRegion} className="grid gap-2">
                    <div className="flex items-center justify-between space-x-2 border rounded-md p-4 cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="sgp1" id="sgp1" />
                        <div className="grid gap-0.5">
                          <Label htmlFor="sgp1" className="cursor-pointer">
                            Singapore • Datacenter 1 • SGP1
                          </Label>
                          <span className="text-xs text-muted-foreground">Asia Pacific</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">16 resources</span>
                    </div>
                    <div className="flex items-center justify-between space-x-2 border rounded-md p-4 cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="lon1" id="lon1" />
                        <div className="grid gap-0.5">
                          <Label htmlFor="lon1" className="cursor-pointer">
                            London • Datacenter 1 • LON1
                          </Label>
                          <span className="text-xs text-muted-foreground">Europe</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">8 resources</span>
                    </div>
                    <div className="flex items-center justify-between space-x-2 border rounded-md p-4 cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="worldwide" id="worldwide" />
                        <div className="grid gap-0.5">
                          <Label htmlFor="worldwide" className="cursor-pointer">
                            Worldwide • Best Available
                          </Label>
                          <span className="text-xs text-muted-foreground">Global Distribution</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">42 resources</span>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Resource Configuration</CardTitle>
                <CardDescription>Configure the components for your project</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList className="bg-blue-50 text-blue-900">
                    <TabsTrigger
                      value="compute"
                      className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      <Server className="h-4 w-4" />
                      <span>Compute</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="gpu"
                      className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      <Zap className="h-4 w-4" />
                      <span>GPU</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="database"
                      className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      <Database className="h-4 w-4" />
                      <span>Database</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="network"
                      className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      <Network className="h-4 w-4" />
                      <span>Network</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="compute" className="space-y-4 pt-2">
                    <div className="space-y-4">
                      <div>
                        <Label>Provider Tier</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div
                            className={`border rounded-md p-4 cursor-pointer hover:bg-gray-50 ${selectedTier === "basic" ? "border-blue-600 bg-blue-50" : ""}`}
                            onClick={() => setSelectedTier("basic")}
                          >
                            <div className="font-medium">Basic</div>
                            <div className="text-xs text-muted-foreground">Shared CPU</div>
                          </div>
                          <div
                            className={`border rounded-md p-4 cursor-pointer hover:bg-gray-50 ${selectedTier === "general" ? "border-blue-600 bg-blue-50" : ""}`}
                            onClick={() => setSelectedTier("general")}
                          >
                            <div className="font-medium">General</div>
                            <div className="text-xs text-muted-foreground">Dedicated CPU</div>
                          </div>
                          <div
                            className={`border rounded-md p-4 cursor-pointer hover:bg-gray-50 ${selectedTier === "premium" ? "border-blue-600 bg-blue-50" : ""}`}
                            onClick={() => setSelectedTier("premium")}
                          >
                            <div className="font-medium">Premium</div>
                            <div className="text-xs text-muted-foreground">High Performance</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>CPU Units</Label>
                          <span className="text-sm font-medium">{cpuUnits} vCPUs</span>
                        </div>
                        <Slider
                          value={[cpuUnits]}
                          min={1}
                          max={32}
                          step={1}
                          onValueChange={(value) => setCpuUnits(value[0])}
                          className="py-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1</span>
                          <span>32</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Memory (RAM)</Label>
                          <span className="text-sm font-medium">{ramGB} GB</span>
                        </div>
                        <Slider
                          value={[ramGB]}
                          min={1}
                          max={128}
                          step={1}
                          onValueChange={(value) => setRamGB(value[0])}
                          className="py-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1 GB</span>
                          <span>128 GB</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Storage</Label>
                          <span className="text-sm font-medium">{storageGB} GB</span>
                        </div>
                        <Slider
                          value={[storageGB]}
                          min={10}
                          max={1000}
                          step={10}
                          onValueChange={(value) => setStorageGB(value[0])}
                          className="py-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>10 GB</span>
                          <span>1000 GB</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="gpu" className="space-y-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="enable-gpu"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={gpuEnabled}
                        onChange={(e) => setGpuEnabled(e.target.checked)}
                      />
                      <Label htmlFor="enable-gpu">Enable GPU</Label>
                    </div>

                    {gpuEnabled && (
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="gpu-type">GPU Type</Label>
                          <Select value={gpuType} onValueChange={setGpuType}>
                            <SelectTrigger id="gpu-type">
                              <SelectValue placeholder="Select GPU type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nvidia-t4">NVIDIA T4</SelectItem>
                              <SelectItem value="nvidia-a100">NVIDIA A100</SelectItem>
                              <SelectItem value="nvidia-rtx">NVIDIA RTX</SelectItem>
                              <SelectItem value="amd-mi100">AMD MI100</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>GPU Units</Label>
                            <span className="text-sm font-medium">{gpuUnits}</span>
                          </div>
                          <Slider
                            value={[gpuUnits]}
                            min={1}
                            max={4}
                            step={1}
                            onValueChange={(value) => setGpuUnits(value[0])}
                            className="py-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1</span>
                            <span>4</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {!gpuEnabled && (
                      <div className="py-8 text-center text-muted-foreground">
                        <p>Enable GPU to configure GPU options</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="database" className="space-y-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="enable-db"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={dbEnabled}
                        onChange={(e) => setDbEnabled(e.target.checked)}
                      />
                      <Label htmlFor="enable-db">Enable Database</Label>
                    </div>

                    {dbEnabled && (
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label>Database Engine</Label>
                          <RadioGroup defaultValue={dbEngine} onValueChange={setDbEngine} className="grid gap-2">
                            <div className="flex items-center justify-between space-x-2 border rounded-md p-4 cursor-pointer hover:bg-gray-50">
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="postgresql" id="postgresql" />
                                <div className="grid gap-0.5">
                                  <Label htmlFor="postgresql" className="cursor-pointer">
                                    PostgreSQL
                                  </Label>
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">v17</span>
                            </div>
                            <div className="flex items-center justify-between space-x-2 border rounded-md p-4 cursor-pointer hover:bg-gray-50">
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="mysql" id="mysql" />
                                <div className="grid gap-0.5">
                                  <Label htmlFor="mysql" className="cursor-pointer">
                                    MySQL
                                  </Label>
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">v8</span>
                            </div>
                            <div className="flex items-center justify-between space-x-2 border rounded-md p-4 cursor-pointer hover:bg-gray-50">
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="mongodb" id="mongodb" />
                                <div className="grid gap-0.5">
                                  <Label htmlFor="mongodb" className="cursor-pointer">
                                    MongoDB
                                  </Label>
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">v7</span>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label>Database Configuration</Label>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            <div
                              className={`border rounded-md p-4 cursor-pointer hover:bg-gray-50 ${selectedTier === "basic" ? "border-blue-600 bg-blue-50" : ""}`}
                              onClick={() => setSelectedTier("basic")}
                            >
                              <div className="font-medium">Basic</div>
                              <div className="text-xs text-muted-foreground">Shared CPU</div>
                            </div>
                            <div
                              className={`border rounded-md p-4 cursor-pointer hover:bg-gray-50 ${selectedTier === "general" ? "border-blue-600 bg-blue-50" : ""}`}
                              onClick={() => setSelectedTier("general")}
                            >
                              <div className="font-medium">General</div>
                              <div className="text-xs text-muted-foreground">Dedicated CPU</div>
                            </div>
                            <div
                              className={`border rounded-md p-4 cursor-pointer hover:bg-gray-50 ${selectedTier === "premium" ? "border-blue-600 bg-blue-50" : ""}`}
                              onClick={() => setSelectedTier("premium")}
                            >
                              <div className="font-medium">Storage-Optimized</div>
                              <div className="text-xs text-muted-foreground">Dedicated CPU</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!dbEnabled && (
                      <div className="py-8 text-center text-muted-foreground">
                        <p>Enable Database to configure database options</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="network" className="space-y-4 pt-2">
                    <div className="py-8 text-center text-muted-foreground">
                      <p>Network configuration options will be available soon</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-24">
              <Card className="border-blue-100">
                <CardHeader className="bg-blue-50">
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>Project configuration details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Project Name</div>
                    <div className="text-sm">{projectName || "Not specified"}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium">Region</div>
                    <div className="text-sm">{selectedRegion ? selectedRegion.toUpperCase() : "Not selected"}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium">Compute</div>
                    <div className="text-sm flex items-center gap-1">
                      <Check className="h-3.5 w-3.5 text-green-500" />
                      {cpuUnits} vCPUs, {ramGB} GB RAM, {storageGB} GB Storage
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} tier
                    </div>
                  </div>

                  {gpuEnabled && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">GPU</div>
                      <div className="text-sm flex items-center gap-1">
                        <Check className="h-3.5 w-3.5 text-green-500" />
                        {gpuUnits} × {gpuType || "Not specified"}
                      </div>
                    </div>
                  )}

                  {dbEnabled && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Database</div>
                      <div className="text-sm flex items-center gap-1">
                        <Check className="h-3.5 w-3.5 text-green-500" />
                        {dbEngine || "Not specified"}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Estimated Cost</div>
                      <div className="text-lg font-bold text-blue-700">${calculateEstimatedCost()}/mo</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Final cost will depend on provider bids</p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label htmlFor="max-price">Maximum Price ($/mo)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="max-price"
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium">USD</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Only providers bidding below this price will be considered
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="bg-blue-50">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleCreateProject}
                    disabled={!projectName}
                  >
                    Create Project
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
