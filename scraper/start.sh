#!/bin/sh
# Démarre un mini serveur HTTP pour le health check Railway
python -c "
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
class H(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'ok')
    def log_message(self, *a): pass
port = int(os.environ.get('PORT', 8080))
HTTPServer(('0.0.0.0', port), H).serve_forever()
" &

# Démarre le worker Celery
exec celery -A scraper.celery_app worker -Q scraping -l info -c 3
