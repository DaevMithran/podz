"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Cloud, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DeployPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order")
  const bidId = searchParams.get("bid")

  // Mock data for the order and selected provider
  const order = {
    id: orderId,
    name: "ML Training Node",
    specs: {
      cpu: 8,
      ram: 32,
      storage: 200,
      gpu: {
        units: 1,
        type: "nvidia-t4",
      },
    },
  }

  const provider = {
    id: "provider-1",
    name: "CloudNode Alpha",
    price: "0.035 XLM/hour",
    totalPrice: "25.2 XLM/month",
  }

  const [deploymentName, setDeploymentName] = useState(order.name)
  const [selectedImage, setSelectedImage] = useState("")
  const [activeTab, setActiveTab] = useState("basic")
  const [environmentVariables, setEnvironmentVariables] = useState([{ key: "", value: "" }])
  const [isDeploying, setIsDeploying] = useState(false)

  const handleAddEnvVar = () => {
    setEnvironmentVariables([...environmentVariables, { key: "", value: "" }])
  }

  const handleEnvVarChange = (index, field, value) => {
    const updatedVars = [...environmentVariables]
    updatedVars[index][field] = value
    setEnvironmentVariables(updatedVars)
  }

  const handleRemoveEnvVar = (index) => {
    if (environmentVariables.length > 1) {
      const updatedVars = [...environmentVariables]
      updatedVars.splice(index, 1)
      setEnvironmentVariables(updatedVars)
    }
  }

  const handleDeploy = () => {
    setIsDeploying(true)

    // In a real app, this would call an API to deploy the container
    setTimeout(() => {
      router.push("/dashboard")
    }, 2000)
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
              <Link href={`/orderbook/${orderId}`} className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back to Order
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 px-4 md:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Deploy {order.name}</h1>
              <p className="text-muted-foreground">Configure and deploy your container to {provider.name}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Deployment Configuration</CardTitle>
                <CardDescription>Configure your container deployment</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="environment">Environment</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deployment-name">Deployment Name</Label>
                      <Input
                        id="deployment-name"
                        value={deploymentName}
                        onChange={(e) => setDeploymentName(e.target.value)}
                        placeholder="Enter a name for this deployment"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="container-image">Container Image</Label>
                      <Select value={selectedImage} onValueChange={setSelectedImage} required>
                        <SelectTrigger id="container-image">
                          <SelectValue placeholder="Select a container image" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tensorflow/tensorflow:latest-gpu">
                            tensorflow/tensorflow:latest-gpu
                          </SelectItem>
                          <SelectItem value="pytorch/pytorch:latest">pytorch/pytorch:latest</SelectItem>
                          <SelectItem value="nginx:latest">nginx:latest</SelectItem>
                          <SelectItem value="postgres:14">postgres:14</SelectItem>
                          <SelectItem value="mongo:latest">mongo:latest</SelectItem>
                          <SelectItem value="custom">Custom Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedImage === "custom" && (
                      <div className="space-y-2">
                        <Label htmlFor="custom-image">Custom Image URL</Label>
                        <Input id="custom-image" placeholder="e.g., ghcr.io/username/image:tag" />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="environment" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Environment Variables</Label>
                        <Button variant="outline" size="sm" onClick={handleAddEnvVar} className="gap-1">
                          <Plus className="h-3.5 w-3.5" /> Add Variable
                        </Button>
                      </div>

                      {environmentVariables.map((envVar, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder="KEY"
                            value={envVar.key}
                            onChange={(e) => handleEnvVarChange(index, "key", e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            placeholder="VALUE"
                            value={envVar.value}
                            onChange={(e) => handleEnvVarChange(index, "value", e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveEnvVar(index)}
                            disabled={environmentVariables.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="startup-command">Startup Command (Optional)</Label>
                      <Input id="startup-command" placeholder="e.g., npm start" />
                      <p className="text-xs text-muted-foreground">
                        Leave blank to use the default command from the container image
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="exposed-ports">Exposed Ports (comma separated)</Label>
                      <Input id="exposed-ports" placeholder="e.g., 80,443,8080" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resource-limits">Resource Limits</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="cpu-limit" className="text-xs">
                            CPU Limit (%)
                          </Label>
                          <Input id="cpu-limit" type="number" placeholder="e.g., 100" min="10" max="100" />
                        </div>
                        <div>
                          <Label htmlFor="memory-limit" className="text-xs">
                            Memory Limit (MB)
                          </Label>
                          <Input id="memory-limit" type="number" placeholder="e.g., 1024" min="128" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleDeploy}
                  disabled={!selectedImage || isDeploying}
                >
                  {isDeploying ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                      Deploying...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4" />
                      Deploy Container
                    </div>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Deployment Summary</CardTitle>
                  <CardDescription>Selected provider and configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Provider</div>
                    <div className="text-sm">{provider.name}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium">Pricing</div>
                    <div className="text-sm">{provider.price}</div>
                    <div className="text-xs text-muted-foreground">Est. {provider.totalPrice}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium">Resources</div>
                    <div className="text-sm">{order.specs.cpu} vCPUs</div>
                    <div className="text-sm">{order.specs.ram} GB RAM</div>
                    <div className="text-sm">{order.specs.storage} GB Storage</div>
                    {order.specs.gpu.units > 0 && (
                      <div className="text-sm">
                        {order.specs.gpu.units} × {order.specs.gpu.type} GPU
                      </div>
                    )}
                  </div>

                  {selectedImage && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Image</div>
                      <div className="text-sm">{selectedImage}</div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Your container will be deployed to the decentralized network and managed by smart contracts.
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
