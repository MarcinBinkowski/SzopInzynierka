import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign } from "lucide-react"

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Orders",
    value: "2,350",
    change: "+180.1%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Products",
    value: "1,234",
    change: "+19%",
    trend: "up",
    icon: Package,
  },
  {
    title: "Customers",
    value: "573",
    change: "-2.1%",
    trend: "down",
    icon: Users,
  },
]

const recentOrders = [
  { id: "ORD-001", customer: "John Doe", product: "Nike Air Max", amount: "$129.99", status: "completed" },
  { id: "ORD-002", customer: "Jane Smith", product: "Adidas Ultraboost", amount: "$180.00", status: "pending" },
  { id: "ORD-003", customer: "Mike Johnson", product: "Puma Running Shoes", amount: "$95.50", status: "shipped" },
  { id: "ORD-004", customer: "Sarah Wilson", product: "Under Armour Hoodie", amount: "$65.00", status: "completed" },
]

function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
                <span>from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders from your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm">{order.product}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-medium">{order.amount}</span>
                  <Badge
                    variant={
                      order.status === "completed" ? "default" : order.status === "pending" ? "secondary" : "outline"
                    }
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
})
