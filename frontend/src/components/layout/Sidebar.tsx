import { useState } from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart3,
  Package,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Tag,
  FolderOpen,
  MapPin,
  Users,
  Globe,
  Building2,
  FileText,
  ShoppingCart,
} from "lucide-react"

const navigation = [
  // { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Products", href: "/catalog/products", icon: Package },
  { name: "Categories", href: "/catalog/categories", icon: FolderOpen },
  { name: "Tags", href: "/catalog/tags", icon: Tag },
  { name: "Manufacturers", href: "/catalog/manufacturers", icon: Building2 },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Addresses", href: "/addresses", icon: MapPin },
  { name: "Profiles", href: "/profiles", icon: Users },
  { name: "Countries", href: "/countries", icon: Globe },
  { name: "Invoice Templates", href: "/invoice-templates", icon: FileText },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SportShop</span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="p-2">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed ? "px-2" : "px-3",
                    isActive && "bg-blue-50 text-blue-700 hover:bg-blue-100",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                  {!collapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
