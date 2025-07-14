import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useCheckoutDashboardRetrieve,
  getCheckoutDashboardRetrieveQueryKey,
  useCheckoutOrdersList,
  checkoutOrdersRetrieve,
  getCheckoutOrdersRetrieveQueryKey,
  checkoutOrdersExportCsvRetrieve,
} from "@/api/generated/shop/checkout/checkout";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Receipt,
  Package,
  Factory,
  Tag,
} from "lucide-react";
import type {
  OrderDetail,
  PaginatedOrdersListResponseList,
} from "@/api/generated/shop/schemas";

function formatCurrency(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "€0.00";
  return `€${num.toFixed(2)}`;
}

type PeriodKey = "24h" | "7d" | "30d" | "lifetime";

const PERIOD_LABEL: Record<PeriodKey, string> = {
  "24h": "Last 24h",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  lifetime: "Lifetime",
};

function DashboardPage() {
  const [period, setPeriod] = useState<PeriodKey>("7d");

  const dateFilter = useMemo(() => {
    if (period === "lifetime") return {};
    const now = new Date();
    const days = period === "24h" ? 1 : period === "7d" ? 7 : 30;
    const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return { created_at__gte: since.toISOString() };
  }, [period]);

  const { data: ordersResponse, isLoading } = useCheckoutOrdersList({
    page: 1,
    page_size: 20,
    ...dateFilter,
  });
  const orders =
    (ordersResponse as PaginatedOrdersListResponseList)?.results ??
    [];

  const { data: stats, isLoading: statsLoading } = useCheckoutDashboardRetrieve(
    { period },
    {
      query: {
        queryKey: [...getCheckoutDashboardRetrieveQueryKey(), { period }],
      },
    },
  );

  const totalOrders = stats?.orders_count ?? 0;
  const revenue = stats?.revenue ?? 0;
  const avgOrder = stats?.avg_order ?? 0;
  const statCards = [
    {
      title: "Revenue",
      value: formatCurrency(revenue),
      change: "",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Orders",
      value: String(totalOrders),
      change: "",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      title: "Avg. Order",
      value: formatCurrency(avgOrder),
      change: "",
      trend: "up",
      icon: Receipt,
    },
  ];

  const detailIds = useMemo(
    () => orders.slice(0, 1000).map((o: any) => String(o.id)),
    [orders],
  );
  const detailQueries = useQueries({
    queries: detailIds.map((id: string) => ({
      queryKey: getCheckoutOrdersRetrieveQueryKey(id),
      queryFn: () => checkoutOrdersRetrieve(id),
      enabled: Boolean(id),
    })),
  });

  const methodsBreakdown = useMemo(() => {
    const entries = stats?.shipping_methods?.entries ?? [];
    const total = stats?.shipping_methods?.total ?? 0;
    return { entries, total };
  }, [stats]);

  const detailsLoading = detailQueries.some((q) => q.isLoading);

  const detailMap = useMemo(() => {
    const map = new Map<number, OrderDetail>();
    for (const q of detailQueries) {
      const d = q.data as OrderDetail | undefined;
      if (d?.id != null) map.set(d.id, d);
    }
    return map;
  }, [detailQueries]);

  const productsBreakdown = useMemo(() => {
    const entries = stats?.products?.entries ?? [];
    const totalQty = stats?.products?.totalQty ?? 0;
    return { entries, totalQty };
  }, [stats]);

  const manufacturers = stats?.manufacturers ?? [];
  const tags = stats?.tags ?? [];
  const couponUsage = stats?.coupon_usage ?? { used: 0, total: 0 };

  const itemsSold = stats?.items_sold ?? 0;
  statCards.splice(2, 0, {
    title: "Items Sold",
    value: String(itemsSold),
    change: "",
    trend: "up",
    icon: Package,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Store overview based on live orders data.
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {(["24h", "7d", "30d", "lifetime"] as PeriodKey[]).map((key) => (
              <Button
                key={key}
                size="sm"
                variant={period === key ? "secondary" : "outline"}
                onClick={() => setPeriod(key)}
              >
                {PERIOD_LABEL[key]}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                const blob = await checkoutOrdersExportCsvRetrieve({ period });
                const url = URL.createObjectURL(blob as Blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `orders_${period}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
            >
              Download CSV (all orders for period)
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading || statsLoading ? "—" : stat.value}
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>Live</span>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Shipping Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            {detailsLoading && (
              <div className="text-sm text-muted-foreground">Loading…</div>
            )}
            {!detailsLoading && methodsBreakdown.total === 0 && (
              <div className="text-sm text-muted-foreground">No data</div>
            )}
            {!detailsLoading && methodsBreakdown.total > 0 && (
              <div className="space-y-2">
                {methodsBreakdown.entries
                  .slice(0, 5)
                  .map((entry: { name: string; count: number }) => {
                    const { name, count } = entry;
                    const pct = Math.round(
                      (count / methodsBreakdown.total) * 100,
                    );
                    return (
                      <div
                        key={name}
                        className="flex items-center justify-between"
                      >
                        <span className="truncate pr-2">{name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{count}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {detailsLoading && (
              <div className="text-sm text-muted-foreground">Loading…</div>
            )}
            {!detailsLoading && productsBreakdown.totalQty === 0 && (
              <div className="text-sm text-muted-foreground">No data</div>
            )}
            {!detailsLoading && productsBreakdown.totalQty > 0 && (
              <div className="space-y-2">
                {productsBreakdown.entries
                  .slice(0, 3)
                  .map(({ name, qty, revenue }) => {
                    const pct = Math.round(
                      (qty / productsBreakdown.totalQty) * 100,
                    );
                    return (
                      <div
                        key={name}
                        className="flex items-center justify-between"
                      >
                        <div className="truncate pr-2">
                          <div className="font-medium truncate max-w-[12rem]">
                            {name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(revenue)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{qty}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Top Manufacturers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {detailsLoading && (
              <div className="text-sm text-muted-foreground">Loading…</div>
            )}
            {!detailsLoading && manufacturers.length === 0 && (
              <div className="text-sm text-muted-foreground">No data</div>
            )}
            {!detailsLoading && manufacturers.length > 0 && (
              <div className="space-y-2">
                {manufacturers
                  .slice(0, 3)
                  .map(({ name, qty }: { name: string; qty: number }) => (
                    <div
                      key={name}
                      className="flex items-center justify-between"
                    >
                      <div className="truncate pr-2 flex items-center gap-2">
                        <Factory className="h-3 w-3 text-muted-foreground" />{" "}
                        <span className="truncate max-w-[12rem]">{name}</span>
                      </div>
                      <Badge variant="secondary">{qty}</Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Tags</CardTitle>
          </CardHeader>
          <CardContent>
            {detailsLoading && (
              <div className="text-sm text-muted-foreground">Loading…</div>
            )}
            {!detailsLoading && tags.length === 0 && (
              <div className="text-sm text-muted-foreground">No data</div>
            )}
            {!detailsLoading && tags.length > 0 && (
              <div className="space-y-2">
                {tags
                  .slice(0, 5)
                  .map(({ name, qty }: { name: string; qty: number }) => (
                    <div
                      key={name}
                      className="flex items-center justify-between"
                    >
                      <div className="truncate pr-2 flex items-center gap-2">
                        <Tag className="h-3 w-3 text-muted-foreground" />{" "}
                        <span className="truncate max-w-[12rem]">{name}</span>
                      </div>
                      <Badge variant="secondary">{qty}</Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Coupon Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {detailsLoading && (
              <div className="text-sm text-muted-foreground">Loading…</div>
            )}
            {!detailsLoading && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Orders with coupon
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{couponUsage.used}</Badge>
                  <span className="text-xs text-muted-foreground">
                    / {couponUsage.total}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders from your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 8).map((order: any) => {
              const detail = detailMap.get(order.id);
              const buyer =
                detail?.shipping_address?.profile?.display_name ||
                detail?.shipping_address?.profile?.user_email;
              const items = detail?.items ?? [];
              const distinctCount = items.length;
              const totalQty = items.reduce(
                (s, it) => s + (it?.quantity ?? 0),
                0,
              );
              const itemPreview = items
                .slice(0, 2)
                .map((it) => {
                  const product = it?.product;
                  return `${product?.name ?? `#${it?.product ?? ""}`} x${it?.quantity ?? 0}`;
                })
                .join(", ");
              const hasMore = distinctCount > 2;
              const shippingMethodName = detail?.shipping_method?.name;
              const couponCodeValue = detail?.applied_coupon?.code;

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-6">
                    <div>
                      <p className="font-mono font-medium">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {buyer && <span>Buyer: {buyer} · </span>}
                        <span>
                          Items: {String(totalQty)} ({distinctCount} types
                          {hasMore ? "+" : ""})
                        </span>
                        {itemPreview && (
                          <span className="ml-1 truncate inline-block max-w-[28rem] align-top">
                            — {itemPreview}
                            {hasMore ? ", …" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    {shippingMethodName && (
                      <Badge
                        variant="outline"
                        className="hidden sm:inline-flex"
                      >
                        {shippingMethodName}
                      </Badge>
                    )}
                    {couponCodeValue && (
                      <Badge
                        variant="secondary"
                        className="hidden sm:inline-flex"
                      >
                        {couponCodeValue}
                      </Badge>
                    )}
                    <span className="font-medium">
                      {formatCurrency(order.total)}
                    </span>
                    <Badge
                      variant={
                        order.status === "delivered"
                          ? "default"
                          : order.status === "pending"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
            {!isLoading && orders.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No orders yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});
