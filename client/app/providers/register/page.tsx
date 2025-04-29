"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Cpu, HardDrive, MemoryStickIcon as Memory, Server, Zap } from "lucide-react"
import Link from "next/link"

export default function ProviderRegistrationPage() {
  const router = useRouter()

  const [providerName, setProviderName] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [cpuCores, setCpuCores] = useState("")
  const [ramGB, setRamGB] = useState("")
  const [storageGB, setStorageGB] = useState("")
  const [hasGPU, setHasGPU] = useState(false)
  const [gpuModels, setGpuModels] = useState([])
  const [walletAddress, setWalletAddress] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)

  const handleRegister = (e) => {
    e.preventDefault()
    setIsRegistering(true)

    // In a real app, this would call an API to register the provider
    setTimeout(() => {
      router.push("/providers/dashboard")
    }, 2000)
  }

  const connectWallet = () => {
    // In a real app, this would connect to the Freighter wallet
    setWalletAddress("GBZX...7YHQ")
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Become a Provider"
        text="Register your compute resources and start earning by fulfilling orders."
        action={
          <Link href="/providers">
            <Button variant="outline" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Providers
            </Button>
          </Link>
        }
      />
      <form onSubmit={handleRegister}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Provider Information</CardTitle>
              <CardDescription>Enter details about your compute offering</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="provider-name">Provider Name</Label>
                <Input
                  id="provider-name"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="e.g., CloudNode Alpha"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your compute offering and any specializations"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Primary Location</Label>
                <Select value={location} onValueChange={setLocation} required>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select your primary location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north-america">North America</SelectItem>
                    <SelectItem value="south-america">South America</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="africa">Africa</SelectItem>
                    <SelectItem value="oceania">Oceania</SelectItem>
                    <SelectItem value="global">Global (Multiple Regions)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resource Specifications</CardTitle>
              <CardDescription>Specify the compute resources you can provide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="cpu-cores">Maximum CPU Cores</Label>
                </div>
                <Input
                  id="cpu-cores"
                  type="number"
                  value={cpuCores}
                  onChange={(e) => setCpuCores(e.target.value)}
                  placeholder="e.g., 32"
                  min="1"
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Memory className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="ram-gb">Maximum RAM (GB)</Label>
                </div>
                <Input
                  id="ram-gb"
                  type="number"
                  value={ramGB}
                  onChange={(e) => setRamGB(e.target.value)}
                  placeholder="e.g., 128"
                  min="1"
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="storage-gb">Maximum Storage (GB)</Label>
                </div>
                <Input
                  id="storage-gb"
                  type="number"
                  value={storageGB}
                  onChange={(e) => setStorageGB(e.target.value)}
                  placeholder="e.g., 1000"
                  min="1"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="has-gpu" checked={hasGPU} onCheckedChange={setHasGPU} />
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="has-gpu">GPU Available</Label>
                </div>
              </div>

              {hasGPU && (
                <div className="grid gap-2">
                  <Label htmlFor="gpu-models">GPU Models</Label>
                  <Select value={gpuModels[0] || ""} onValueChange={(value) => setGpuModels([value])} required={hasGPU}>
                    <SelectTrigger id="gpu-models">
                      <SelectValue placeholder="Select GPU model" />
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wallet Connection</CardTitle>
              <CardDescription>Connect your Stellar wallet to receive payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input value={walletAddress} readOnly placeholder="Connect your Freighter wallet" />
                </div>
                <Button type="button" onClick={connectWallet} disabled={walletAddress}>
                  {walletAddress ? "Connected" : "Connect Wallet"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                We use Stellar Soroban smart contracts for secure escrow and payments. Make sure you have the Freighter
                wallet extension installed.
              </p>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isRegistering || !walletAddress}>
                {isRegistering ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                    Registering...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Register as Provider
                  </div>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </DashboardShell>
  )
}
