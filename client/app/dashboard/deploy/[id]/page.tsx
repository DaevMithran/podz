"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Cloud, Server } from "lucide-react"
import Link from "next/link"

export default function DeployPage({ params }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { id } = params
  const bidId = searchParams.get("bid")

  // In a real app, these would be fetched from an API
  const [order, setOrder] = useState({
    id,
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
  })

  const [provider, setProvider] = useState({
    id: "provider-1",
    name: "CloudNode Alpha",
    price: "0.035 XLM/hour",
    totalPrice: "25.2 XLM/month",
  })

  const [deploymentName, setDeploymentName] = useState(order.name)
  const [selectedImage, setSelectedImage] = useState("")
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
    const updatedVars = [...environmentVariables]
    updatedVars.splice(index, 1)
    setEnvironmentVariables(updatedVars)
  }

  const handleDeploy = () => {
    setIsDeploying(true)

    // In a real app, this would call an API to deploy the container
    setTimeout(() => {
      router.push("/dashboard")
    }, 2000)
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Deploy Container"
        text="Configure and deploy your container to the selected provider."
        action={
          <Link href={`/orderbook/${id}`}>
            <Button variant="outline" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Order
            </Button>
          </Link>
        }
      />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Deployment Configuration</CardTitle>
            <CardDescription>Configure your container deployment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="deployment-name">Deployment Name</Label>
                <Input
                  id="deployment-name"
                  value={deploymentName}
                  onChange={(e) => setDeploymentName(e.target.value)}
                  placeholder="Enter a name for this deployment"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="container-image">Container Image</Label>
                <Select value={selectedImage} onValueChange={setSelectedImage} required>
                  <SelectTrigger id="container-image">
                    <SelectValue placeholder="Select a container image" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tensorflow/tensorflow:latest-gpu">tensorflow/tensorflow:latest-gpu</SelectItem>
                    <SelectItem value="pytorch/pytorch:latest">pytorch/pytorch:latest</SelectItem>
                    <SelectItem value="nginx:latest">nginx:latest</SelectItem>
                    <SelectItem value="postgres:14">postgres:14</SelectItem>
                    <SelectItem value="mongo:latest">mongo:latest</SelectItem>
                    <SelectItem value="custom">Custom Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedImage === "custom" && (
                <div className="grid gap-2">
                  <Label htmlFor="custom-image">Custom Image URL</Label>
                  <Input id="custom-image" placeholder="e.g., ghcr.io/username/image:tag" />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Environment Variables</Label>
                <Button variant="outline" size="sm" onClick={handleAddEnvVar}>
                  Add Variable
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
                    disabled={environmentVariables.length === 1 && index === 0}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-muted-foreground" />
                <div className="font-medium">Selected Provider: {provider.name}</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Price: {provider.price} (Est. {provider.totalPrice} per month)
              </div>
            </div>
            <Button className="w-full" onClick={handleDeploy} disabled={!selectedImage || isDeploying}>
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
    </DashboardShell>
  )
}
