import time


class TimeDelayMiddleware(object):
    """Middleware that introduces a delay for each request. Used for testing"""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # time.sleep(2)  # Delay in seconds
        response = self.get_response(request)
        return response
