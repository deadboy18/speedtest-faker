#!/usr/bin/env python3
"""
Speedtest Faker - Server
Run: python server.py
Open: http://localhost:8888
"""
import http.server, json, hashlib, urllib.request, urllib.parse, os, sys

PORT = 8888
OOKLA_API = "https://www.speedtest.net/api/api.php"
SALT = "297aae72"

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == "/api/generate":
            try:
                body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
                dl = int(float(body.get("download", 0)) * 1000)
                ul = int(float(body.get("upload", 0)) * 1000)
                ping = int(body.get("ping", 10))
                srv = str(body.get("server", "15028"))
                h = hashlib.md5(f"{ping}-{ul}-{dl}-{SALT}".encode()).hexdigest()
                post = urllib.parse.urlencode({
                    "startmode": "recommendedselect", "promo": "",
                    "upload": ul, "accuracy": 8,
                    "recommendedserverid": srv, "serverid": srv,
                    "ping": ping, "hash": h, "download": dl,
                }).encode()
                req = urllib.request.Request(OOKLA_API, data=post, headers={
                    "User-Agent": "Speedtest",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Origin": "https://www.speedtest.net",
                    "Referer": "https://www.speedtest.net",
                })
                with urllib.request.urlopen(req, timeout=15) as r:
                    result = r.read().decode()
                params = dict(urllib.parse.parse_qsl(result))
                rid = params.get("resultid", "")
                if rid:
                    self._json(200, {"success": True, "result_id": rid,
                        "result_url": f"https://www.speedtest.net/result/{rid}",
                        "image_url": f"https://www.speedtest.net/result/{rid}.png"})
                else:
                    self._json(200, {"success": False, "error": "No result ID", "raw": result[:500]})
            except Exception as e:
                self._json(500, {"success": False, "error": str(e)})
        else:
            self.send_error(404)

    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            self._file("index.html", "text/html")
        elif self.path == "/favicon.ico":
            # Browser asks for this even though the HTML has an inline SVG favicon.
            # Serve it if it exists, otherwise return 204 silently (no 404 spam).
            ico = os.path.join(os.path.dirname(os.path.abspath(__file__)), "favicon.ico")
            if os.path.isfile(ico):
                self._file("favicon.ico", "image/x-icon")
            else:
                self.send_response(204)
                self.end_headers()
        elif self.path == "/og-image.png":
            self._file("og-image.png", "image/png")
        elif self.path.startswith("/api/servers"):
            qs = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            search = qs.get("search", [""])[0]
            limit = qs.get("limit", ["20"])[0]
            url = f"https://www.speedtest.net/api/js/servers?engine=js&search={urllib.parse.quote(search)}&https_functional=true&limit={limit}"
            try:
                req = urllib.request.Request(url, headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Referer": "https://www.speedtest.net/", "Accept": "application/json"})
                with urllib.request.urlopen(req, timeout=10) as r:
                    data = r.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(data)
            except Exception as e:
                self._json(502, {"error": str(e)})
        else:
            super().do_GET()

    def _file(self, name, ct):
        path = os.path.join(os.path.dirname(os.path.abspath(__file__)), name)
        try:
            with open(path, "rb") as f: content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", f"{ct}; charset=utf-8")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_error(404)

    def _json(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def handle_one_request(self):
        """Wrap parent to suppress connection-abort errors on Windows."""
        try:
            super().handle_one_request()
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            self.close_connection = True

    def log_message(self, fmt, *args):
        # fmt for requests: '"%s" %s %s' → args = (requestline, code, size)
        # fmt for errors:   'code %d, message %s' → args = (code, message)
        if len(args) >= 3:
            print(f"  {args[0]}")
        elif args:
            pass  # suppress stray error-code lines (e.g. favicon 404)

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    os.chdir(os.path.dirname(os.path.abspath(__file__)) or ".")
    srv = http.server.HTTPServer(("0.0.0.0", port), Handler)
    print(f"\n  ⚡ Speedtest Faker running on http://localhost:{port}\n  Press Ctrl+C to stop\n")
    try: srv.serve_forever()
    except KeyboardInterrupt: print("\n  Stopped."); srv.shutdown()
