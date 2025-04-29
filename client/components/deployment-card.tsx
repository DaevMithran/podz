import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Terminal } from "lucide-react"

interface DeploymentCardProps {
  deployment: {
    id: string
    name: string
    provider: string
    status: string
    specs: string
    image: string
    uptime: string
    cost: string
  }
}

export function DeploymentCard({ deployment }: DeploymentCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{deployment.name}</CardTitle>
            <CardDescription>{deployment.provider}</CardDescription>
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
              <DropdownMenuItem>Access Terminal</DropdownMenuItem>
              <DropdownMenuItem>Restart</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Terminate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-2">
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
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Badge variant={deployment.status === "Running" ? "default" : "outline"}>{deployment.status}</Badge>
        <Button variant="outline" size="sm" className="gap-1">
          <Terminal className="h-3.5 w-3.5" />
          Console
        </Button>
      </CardFooter>
    </Card>
  )
}
