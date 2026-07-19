# Middleware CORS universel garanti pour autoriser toutes les origines Vercel et locales
class AllowAllCorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Réponse immédiate pour les requêtes Preflight OPTIONS
        if request.method == "OPTIONS":
            from django.http import HttpResponse
            response = HttpResponse(status=200)
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Headers"] = "*"
            response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            return response

        response = self.get_response(request)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Headers"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        return response
