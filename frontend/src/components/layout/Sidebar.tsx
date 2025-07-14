import { useState, useMemo } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
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
  Ticket,
  Receipt,
  Truck,
  Bell,
} from "lucide-react";

const navigation = [
  { name: "Products", href: "/catalog/products", icon: Package },
  { name: "Categories", href: "/catalog/categories", icon: FolderOpen },
  { name: "Tags", href: "/catalog/tags", icon: Tag },
  { name: "Manufacturers", href: "/catalog/manufacturers", icon: Building2 },
  { name: "Suppliers", href: "/catalog/suppliers", icon: Building2 },
  { name: "Deliveries", href: "/catalog/deliveries", icon: Package },

  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Coupons", href: "/checkout/coupons", icon: Ticket },
  { name: "Invoices", href: "/checkout/invoices", icon: Receipt },
  { name: "Shipping Methods", href: "/checkout/shipping-methods", icon: Truck },
  { name: "Couriers", href: "/checkout/couriers", icon: Truck },
  { name: "Shipments", href: "/checkout/shipments", icon: Truck },
  { name: "Order Notes", href: "/checkout/order-notes", icon: FileText },
  { name: "Payments", href: "/checkout/payments", icon: Receipt },
  {
    name: "Coupon Redemptions",
    href: "/checkout/coupon-redemptions",
    icon: Ticket,
  },
  { name: "Invoice Templates", href: "/invoice-templates", icon: FileText },

  { name: "Profiles", href: "/profiles", icon: Users },
  { name: "Addresses", href: "/addresses", icon: MapPin },

  { name: "Countries", href: "/countries", icon: Globe },
  { name: "Notifications", href: "/notifications/history", icon: Bell },
  {
    name: "Notification Settings",
    href: "/notifications/preferences",
    icon: Bell,
  },
];

interface SidebarProps {
  searchTerm: string;
}

export default function Sidebar({ searchTerm }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const filteredNavigation = useMemo(() => {
    if (!searchTerm.trim()) {
      return navigation;
    }

    const searchLower = searchTerm.toLowerCase();
    return navigation.filter(
      (item) =>
        item.name.toLowerCase().includes(searchLower) ||
        item.href.toLowerCase().includes(searchLower),
    );
  }, [searchTerm]);

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SportShop</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="p-2"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
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
                  <item.icon
                    className={cn("h-5 w-5", collapsed ? "" : "mr-3")}
                  />
                  {!collapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            );
          })}
          {filteredNavigation.length === 0 && searchTerm.trim() && (
            <div className="text-center text-gray-500 text-sm py-4">
              No matching items found
            </div>
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}
