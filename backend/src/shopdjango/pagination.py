from collections import OrderedDict
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from typing import Dict, Any


class StandardPagination(PageNumberPagination):
    """Standard pagination for most list views across the application."""

    page_size: int = 10
    page_size_query_param: str = "page_size"
    max_page_size: int = 100
    page_query_param: str = "page"

    def get_paginated_response(self, data: list[Dict[str, Any]]) -> Response:
        """Return enhanced pagination response with additional metadata."""
        return Response(
            OrderedDict(
                [
                    ("count", self.page.paginator.count),
                    ("next", self.get_next_link()),
                    ("previous", self.get_previous_link()),
                    ("total_pages", self.page.paginator.num_pages),
                    ("current_page", self.page.number),
                    ("page_size", self.get_page_size(self.request)),
                    ("results", data),
                ]
            )
        )
