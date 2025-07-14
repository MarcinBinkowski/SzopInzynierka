from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Count
from django.http import HttpResponse
import csv
from drf_spectacular.utils import (
    extend_schema,
    OpenApiParameter,
    OpenApiTypes,
)
from drf_spectacular.utils import OpenApiResponse
from apps.checkout.models.order import Order
from apps.checkout.models.order_item import OrderItem
from apps.profile.models import Profile
from apps.profile.permissions import ReadOnlyOrRoles
from apps.checkout.serializers.analytics import DashboardStatsSerializer


class DashboardAnalyticsView(APIView):
    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN, Profile.Role.EMPLOYEE})]

    @extend_schema(
        summary="Dashboard analytics",
        description="Get dashboard statistics for the given period (24h, 7d, 30d, lifetime)",
        parameters=[
            OpenApiParameter(
                name="period",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                description="24h | 7d | 30d | lifetime",
            )
        ],
        responses={200: DashboardStatsSerializer},
    )
    def get(self, request):
        period = request.query_params.get("period", "7d")
        now = timezone.now()
        if period == "24h":
            since = now - timedelta(days=1)
        elif period == "7d":
            since = now - timedelta(days=7)
        elif period == "30d":
            since = now - timedelta(days=30)
        elif period == "lifetime":
            since = None
        else:
            return Response(
                {"error": "Invalid period"}, status=status.HTTP_400_BAD_REQUEST
            )

        qs = Order.objects.all()

        if since is not None:
            qs = qs.filter(created_at__gte=since)

        total_orders = qs.count()
        revenue = qs.aggregate(v=Sum("total"))["v"] or 0
        avg_order = (revenue / total_orders) if total_orders else 0

        items_qs = OrderItem.objects.filter(order__in=qs)
        items_sold = items_qs.aggregate(v=Sum("quantity"))["v"] or 0

        methods = list(
            qs.values("shipping_method__name")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        methods_entries = [
            {"name": m["shipping_method__name"] or "Unknown", "count": m["count"]}
            for m in methods
        ]
        methods_total = sum(m["count"] for m in methods_entries)

        products = list(
            items_qs.values("product__name")
            .annotate(qty=Sum("quantity"), revenue=Sum("total_price"))
            .order_by("-qty")
        )
        products_entries = [
            {
                "name": p["product__name"] or "Unknown",
                "qty": int(p["qty"] or 0),
                "revenue": float(p["revenue"] or 0),
            }
            for p in products
        ]
        total_qty = sum(p["qty"] for p in products_entries)

        manufacturers = list(
            items_qs.values("product__manufacturer__name")
            .annotate(qty=Sum("quantity"))
            .order_by("-qty")
        )
        manufacturers_entries = [
            {
                "name": m["product__manufacturer__name"] or "Unknown",
                "qty": int(m["qty"] or 0),
            }
            for m in manufacturers
        ]

        tags = list(
            items_qs.filter(product__tags__isnull=False)
            .values("product__tags__name")
            .annotate(qty=Sum("quantity"))
            .order_by("-qty")
        )
        tags_entries = [
            {"name": t["product__tags__name"] or "Unknown", "qty": int(t["qty"] or 0)}
            for t in tags
        ]

        used = qs.filter(applied_coupon__isnull=False).count()
        coupon_usage = {"used": used, "total": total_orders}
        data = {
            "period": period,
            "orders_count": total_orders,
            "revenue": float(revenue),
            "avg_order": float(avg_order),
            "items_sold": int(items_sold),
            "shipping_methods": {"entries": methods_entries, "total": methods_total},
            "products": {"entries": products_entries, "totalQty": total_qty},
            "manufacturers": manufacturers_entries,
            "tags": tags_entries,
            "coupon_usage": coupon_usage,
        }

        return Response(data)


class OrdersExportCsvView(APIView):
    def get_permissions(self):
        return [ReadOnlyOrRoles({Profile.Role.ADMIN, Profile.Role.EMPLOYEE})]

    @extend_schema(
        summary="Export orders CSV",
        description="Download CSV of orders for the given period (24h, 7d, 30d, lifetime)",
        parameters=[
            OpenApiParameter(
                name="period",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                description="24h | 7d | 30d | lifetime",
            )
        ],
        responses={
            200: OpenApiResponse(
                response=OpenApiTypes.BINARY, description="CSV file (text/csv)"
            )
        },
    )
    def get(self, request):
        period = request.query_params.get("period", "7d")
        now = timezone.now()
        if period == "24h":
            since = now - timedelta(days=1)
        elif period == "7d":
            since = now - timedelta(days=7)
        elif period == "30d":
            since = now - timedelta(days=30)
        elif period == "lifetime":
            since = None
        else:
            return Response(
                {"error": "Invalid period"}, status=status.HTTP_400_BAD_REQUEST
            )

        qs = Order.objects.select_related(
            "shipping_method",
            "shipping_address",
            "applied_coupon",
        )

        if since is not None:
            qs = qs.filter(created_at__gte=since)

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="orders_{period}.csv"'

        writer = csv.writer(response)
        writer.writerow(
            [
                "id",
                "order_number",
                "created_at",
                "status",
                "subtotal",
                "shipping_cost",
                "total",
                "shipping_method_name",
                "coupon_code",
                "buyer_display_name",
                "buyer_email",
                "shipping_country",
                "shipping_city",
            ]
        )

        for o in qs.iterator():
            shipping_method_name = (
                getattr(o.shipping_method, "name", "") if o.shipping_method else ""
            )
            coupon_code = (
                getattr(o.applied_coupon, "code", "") if o.applied_coupon else ""
            )
            shipping_address = getattr(o, "shipping_address", None)
            buyer_display_name = ""
            buyer_email = ""
            country_name = ""
            city = ""
            if shipping_address is not None:
                profile = getattr(shipping_address, "profile", None)
                buyer_display_name = (
                    getattr(profile, "display_name", "") if profile else ""
                )
                buyer_email = getattr(profile, "user_email", "") if profile else ""
                country = getattr(shipping_address, "country", None)
                country_name = getattr(country, "name", "") if country else ""
                city = getattr(shipping_address, "city", "") or ""

            writer.writerow(
                [
                    o.id,
                    o.order_number,
                    o.created_at.isoformat(),
                    o.status,
                    str(o.subtotal),
                    str(o.shipping_cost),
                    str(o.total),
                    shipping_method_name,
                    coupon_code,
                    buyer_display_name,
                    buyer_email,
                    country_name,
                    city,
                ]
            )

        return response
