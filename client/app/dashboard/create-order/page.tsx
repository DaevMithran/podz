"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Cpu, HardDrive, MemoryStickIcon as Memory, Zap } from "lucide-react"

export default function CreateOrderPage() {
  const router = useRouter()
  const [orderName, setOrderName] = useState("")
  const [cpuUnits, setCpuUnits] = useState(2)
  const [ramGB, setRamGB] = useState(4)
  const [storageGB, setStorageGB] = useState(50)
  const [gpuUnits, setGpuUnits] = useState(0)
  const [gpuType, setGpuType] = useState("")
  const [duration, setDuration] = useState("hourly")
  const [estimatedCost, setEstimatedCost] = useState("0.025 - 0.045 XLM/hour")

  const handleSubmit = (e) => {
    e.preventDefault()

    // In a real app, this would call an API to create the order
    console.log("Creating order:", {
      name: orderName,
      specs: {
        cpu: cpuUnits,
        ram: ramGB,
        storage: storageGB,
        gpu: {
          units: gpuUnits,
          type: gpuType,
        },
      },
      duration,
    })

    // Navigate to the orderbook to see the created order
    router.push("/orderbook")
  }

  // Update estimated cost when specs change
  const updateEstimatedCost = () => {
    const baseCost = 0.01 + cpuUnits * 0.005 + ramGB * 0.002 + storageGB * 0.0001
    const gpuCost = gpuUnits > 0 ? gpuUnits * 0.05 : 0
    const totalCost = baseCost + gpuCost

    // Provide a range for the estimated cost
    const minCost = totalCost.toFixed(3)
    const maxCost = (totalCost * 1.8).toFixed(3)

    if (duration === "hourly") {
      setEstimatedCost(`${minCost} - ${maxCost} XLM/hour`)
    } else if (duration === "daily") {
      setEstimatedCost(`${(minCost * 24).toFixed(2)} - ${(maxCost * 24).toFixed(2)} XLM/day`)
    } else if (duration === "monthly") {
      setEstimatedCost(`${(minCost * 24 * 30).toFixed(2)} - ${(maxCost * 24 * 30).toFixed(2)} XLM/month`)
    }
  }

  // Update cost estimate when any spec changes
  useState(() => {
    updateEstimatedCost()
  }, [cpuUnits, ramGB, storageGB, gpuUnits, gpuType, duration])

  return (
    <DashboardShell>
      <DashboardHeader heading="Create Order" text="Specify your compute requirements and create a new order." />
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>Name your order and specify the compute resources you need.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order-name">Order Name</Label>
                <Input
                  id="order-name"
                  placeholder="e.g., Web Server Cluster"
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-6 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" /> CPU Units
                    </Label>
                    <span className="text-sm font-medium">{cpuUnits} vCPUs</span>
                  </div>
                  <Slider
                    value={[cpuUnits]}
                    min={1}
                    max={32}
                    step={1}
                    onValueChange={(value) => setCpuUnits(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>32</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Memory className="h-4 w-4" /> Memory (RAM)
                    </Label>
                    <span className="text-sm font-medium">{ramGB} GB</span>
                  </div>
                  <Slider value={[ramGB]} min={1} max={128} step={1} onValueChange={(value) => setRamGB(value[0])} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 GB</span>
                    <span>128 GB</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4" /> Storage
                    </Label>
                    <span className="text-sm font-medium">{storageGB} GB</span>
                  </div>
                  <Slider
                    value={[storageGB]}
                    min={10}
                    max={1000}
                    step={10}
                    onValueChange={(value) => setStorageGB(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10 GB</span>
                    <span>1000 GB</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Zap className="h-4 w-4" /> GPU Units
                    </Label>
                    <span className="text-sm font-medium">{gpuUnits}</span>
                  </div>
                  <Slider
                    value={[gpuUnits]}
                    min={0}
                    max={4}
                    step={1}
                    onValueChange={(value) => setGpuUnits(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>4</span>
                  </div>
                </div>

                {gpuUnits > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="gpu-type">GPU Type</Label>
                    <Select value={gpuType} onValueChange={setGpuType} required={gpuUnits > 0}>
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
                )}

                <div className="space-y-2">
                  <Label htmlFor="duration">Billing Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select billing duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start space-y-4">
              <div className="w-full">
                <div className="text-sm font-medium">Estimated Cost Range:</div>
                <div className="text-2xl font-bold">{estimatedCost}</div>
                <p className="text-xs text-muted-foreground">
                  Final cost will depend on provider bids. You'll be able to select from available providers.
                </p>
              </div>
              <Button type="submit" className="w-full">
                Create Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </DashboardShell>
  )
}
