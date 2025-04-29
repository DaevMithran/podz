import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  ArrowRight,
  Cloud,
  Database,
  Server,
  Shield,
  Boxes,
  Globe,
  Coins,
  Zap,
  CheckCircle,
  Lock,
  TrendingDown,
} from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Cloud className="h-6 w-6 text-blue-600" />
            <span className="text-blue-600">PodZ</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
              Dashboard
            </Link>
            <Link href="/orderbook" className="text-sm font-medium hover:underline underline-offset-4">
              Orderbook
            </Link>
            <Link href="/providers" className="text-sm font-medium hover:underline underline-offset-4">
              Providers
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700">Launch Console</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white">
                    Decentralized Compute Marketplace
                  </h1>
                  <p className="max-w-[600px] text-blue-100 md:text-xl">
                    Deploy containers on a decentralized network of providers. Choose your specs, select the best bid,
                    and deploy in minutes.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/create">
                    <Button size="lg" className="gap-1 bg-white text-blue-600 hover:bg-blue-50">
                      Create Project <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/providers/register">
                    <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-700">
                      Become a Provider
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-400 to-blue-300 opacity-30 blur-xl"></div>
                  <div className="relative bg-white p-6 rounded-lg shadow-xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-50">
                        <Server className="h-10 w-10 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Compute</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-50">
                        <Database className="h-10 w-10 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Storage</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-50">
                        <Zap className="h-10 w-10 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">GPU</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-50">
                        <Globe className="h-10 w-10 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Global</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">
                  Powered by Stellar
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Decentralized Computing Made Simple</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Access compute resources from providers around the world with transparent pricing and secure payments
                </p>
              </div>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12 mt-12">
              {/* Multi-Currency Support Card */}
              <div className="group relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent opacity-50"></div>
                <div className="relative flex h-full flex-col justify-between rounded-md p-6">
                  <div className="space-y-4">
                    <div className="h-48 rounded-lg overflow-hidden bg-blue-100">
                      <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-50 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center transform rotate-12">
                            <span className="text-lg font-bold text-blue-700">XLM</span>
                          </div>
                          <div className="absolute -top-2 left-8 w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center transform -rotate-6">
                            <span className="text-lg font-bold text-green-600">USDC</span>
                          </div>
                          <div className="absolute top-8 -left-2 w-18 h-18 rounded-full bg-white shadow-lg flex items-center justify-center transform rotate-3">
                            <span className="text-lg font-bold text-blue-500">EUROC</span>
                          </div>
                          <Coins className="h-20 w-20 text-blue-700 relative z-10" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold">Multi-Currency Support</h3>
                    <p className="text-muted-foreground">
                      Pay with USDC, EUROC, or native XLM. Providers choose which currencies to accept, with automatic
                      conversion.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      USDC
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      EUROC
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      XLM
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Escrow Card */}
              <div className="group relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="absolute inset-0 bg-gradient-to-b from-green-50 to-transparent opacity-50"></div>
                <div className="relative flex h-full flex-col justify-between rounded-md p-6">
                  <div className="space-y-4">
                    <div className="h-48 rounded-lg overflow-hidden bg-green-100">
                      <div className="w-full h-full bg-gradient-to-br from-green-200 to-green-50 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 w-32 h-32 bg-white/30 rounded-full animate-pulse"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center">
                              <Lock className="h-12 w-12 text-green-600" />
                            </div>
                          </div>
                          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                            <div className="w-40 h-40 border-4 border-dashed border-green-300 rounded-full animate-spin-slow"></div>
                          </div>
                          <Shield className="h-20 w-20 text-green-700 relative z-10" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold">Secure Escrow</h3>
                    <p className="text-muted-foreground">
                      Funds are held in secure smart contracts that automatically release payment when service level
                      agreements are met.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      Automatic Verification
                    </div>
                    <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                      Dispute Resolution
                    </div>
                  </div>
                </div>
              </div>

              {/* Low Transaction Fees Card */}
              <div className="group relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-50 to-transparent opacity-50"></div>
                <div className="relative flex h-full flex-col justify-between rounded-md p-6">
                  <div className="space-y-4">
                    <div className="h-48 rounded-lg overflow-hidden bg-amber-100">
                      <div className="w-full h-full bg-gradient-to-br from-amber-200 to-amber-50 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute -top-4 -left-4 w-16 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-amber-700">$0.01</span>
                          </div>
                          <div className="absolute top-4 left-12 w-16 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-green-600">$0.001</span>
                          </div>
                          <div className="absolute top-12 -left-2 w-16 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">$0.0001</span>
                          </div>
                          <TrendingDown className="h-20 w-20 text-amber-700 relative z-10" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold">Low Transaction Fees</h3>
                    <p className="text-muted-foreground">
                      Stellar's low transaction fees mean more of your money goes toward computing resources rather than
                      network costs.
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-amber-50 rounded-md">
                    <div className="text-sm font-medium text-amber-700">Average transaction cost</div>
                    <div className="text-2xl font-bold text-amber-800">0.00001 XLM</div>
                    <div className="text-xs text-amber-600">Approximately $0.000005 USD</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">Simple Process</div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Our decentralized marketplace connects you with compute providers around the world
                </p>
              </div>
            </div>

            <div className="mt-16 relative">
              {/* Timeline connector with animation */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full hidden md:flex flex-col items-center">
                <div className="w-1 bg-gradient-to-b from-blue-300 to-blue-600 flex-grow"></div>
                <div className="absolute top-0 h-full w-1 overflow-hidden">
                  <div className="h-4 w-1 bg-blue-200 animate-pulse absolute top-0 transform translate-y-full animate-timeline"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                {/* Step 1 */}
                <div className="md:text-right relative group">
                  <div className="hidden md:block absolute right-0 top-6 w-8 h-8 rounded-full border-4 border-blue-200 bg-blue-600 transform translate-x-1/2 z-10 shadow-lg group-hover:scale-110 transition-transform"></div>
                  <div className="bg-white p-6 rounded-lg shadow-lg md:mr-8 border border-blue-100 group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mt-12 -mr-12 opacity-70"></div>
                    <div className="flex md:justify-end mb-4 relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md">
                        <Server className="h-8 w-8" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-blue-800">1. Create Project</h3>
                    <p className="text-muted-foreground mt-2 relative">
                      Specify your compute requirements including CPU, RAM, storage, and optional GPU resources
                    </p>
                    <div className="flex md:justify-end mt-4 relative">
                      <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Listed in orderbook</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Empty space for step 1 on mobile */}
                <div className="hidden md:block"></div>

                {/* Empty space for step 2 on mobile */}
                <div className="hidden md:block"></div>

                {/* Step 2 */}
                <div className="relative group">
                  <div className="hidden md:block absolute left-0 top-6 w-8 h-8 rounded-full border-4 border-blue-200 bg-blue-600 transform -translate-x-1/2 z-10 shadow-lg group-hover:scale-110 transition-transform"></div>
                  <div className="bg-white p-6 rounded-lg shadow-lg md:ml-8 border border-blue-100 group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-green-50 rounded-full -mt-12 -ml-12 opacity-70"></div>
                    <div className="flex mb-4 relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white shadow-md">
                        <Database className="h-8 w-8" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-green-800">2. Select Provider</h3>
                    <p className="text-muted-foreground mt-2 relative">
                      Compare bids from different providers based on price, reputation, and performance metrics
                    </p>
                    <div className="flex mt-4 relative">
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Transparent pricing</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="md:text-right relative group">
                  <div className="hidden md:block absolute right-0 top-6 w-8 h-8 rounded-full border-4 border-blue-200 bg-blue-600 transform translate-x-1/2 z-10 shadow-lg group-hover:scale-110 transition-transform"></div>
                  <div className="bg-white p-6 rounded-lg shadow-lg md:mr-8 border border-blue-100 group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mt-12 -mr-12 opacity-70"></div>
                    <div className="flex md:justify-end mb-4 relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-md">
                        <Boxes className="h-8 w-8" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-purple-800">3. Deploy & Manage</h3>
                    <p className="text-muted-foreground mt-2 relative">
                      Launch your container with your selected image and monitor performance through our dashboard
                    </p>
                    <div className="flex md:justify-end mt-4 relative">
                      <div className="flex items-center gap-2 text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Real-time monitoring</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final step */}
              <div className="mt-12 text-center">
                <div className="inline-block relative">
                  <div className="absolute inset-0 bg-blue-200 blur-xl opacity-30 rounded-full"></div>
                  <Link href="/create">
                    <Button
                      size="lg"
                      className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg px-8 py-6 h-auto relative"
                    >
                      Get Started <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-gray-50">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12">
          <div className="flex flex-col gap-2 md:gap-4 md:flex-1">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Cloud className="h-6 w-6 text-blue-600" />
              <span className="text-blue-600">DeCloud Market</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A decentralized marketplace for compute resources powered by Stellar.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:flex-1">
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Platform</h3>
              <nav className="grid gap-2">
                <Link href="#" className="text-sm text-muted-foreground hover:underline">
                  Dashboard
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:underline">
                  Orderbook
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:underline">
                  Providers
                </Link>
              </nav>
            </div>
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Resources</h3>
              <nav className="grid gap-2">
                <Link href="#" className="text-sm text-muted-foreground hover:underline">
                  Documentation
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:underline">
                  API Reference
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:underline">
                  Support
                </Link>
              </nav>
            </div>
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Legal</h3>
              <nav className="grid gap-2">
                <Link href="#" className="text-sm text-muted-foreground hover:underline">
                  Terms
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:underline">
                  Privacy
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:underline">
                  Contact
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
