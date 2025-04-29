import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Terminal } from "lucide-react"

interface ActiveLeaseCardProps {
  lease: {
    id: string
    name: string
    user: string
    specs: string
    image: string
    uptime: string
    earnings: string
    status: string
  }
}

export function ActiveLeaseCard({ lease }: ActiveLeaseCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{lease.name}</CardTitle>
            <CardDescription>Leased by {lease.user}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Check Health</DropdownMenuItem>
              <DropdownMenuItem>Restart Container</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-2">
          <div className="text-sm">
            <span className="font-medium">Specs:</span> {lease.specs}
          </div>
          <div className="text-sm">
            <span className="font-medium">Image:</span> {lease.image}
          </div>
          <div className="text-sm">
            <span className="font-medium">Uptime:</span> {lease.uptime}
          </div>
          <div className="text-sm">
            <span className="font-medium">Earnings:</span> {lease.earnings}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Badge variant={lease.status === "Running" ? "default" : "outline"}>{lease.status}</Badge>
        <Button variant="outline" size="sm" className="gap-1">
          <Terminal className="h-3.5 w-3.5" />
          Console
        </Button>
      </CardFooter>
    </Card>
  )
}
