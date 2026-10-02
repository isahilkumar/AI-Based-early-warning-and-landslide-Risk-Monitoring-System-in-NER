"""
Single-Service Frontend + Backend Unified Controller for LANDSAFE-NER
"""
import os
import mimetypes
from pathlib import Path
from django.http import HttpResponse, FileResponse, Http404
from django.conf import settings

def serve_react_app(request, path=''):
    """
    Serves the compiled React Vite Single Page Application (SPA)
    and all associated static assets (JS, CSS, SVGs) under the same origin.
    """
    frontend_dist = settings.WORKSPACE_DIR / 'frontend' / 'dist'
    
    # Check if a specific static asset inside dist is requested (e.g. assets/..., favicon.svg, icons.svg)
    if path:
        target_file = (frontend_dist / path).resolve()
        # Security check: ensure target_file is inside frontend_dist
        if str(target_file).startswith(str(frontend_dist.resolve())) and target_file.exists() and target_file.is_file():
            content_type, _ = mimetypes.guess_type(str(target_file))
            return FileResponse(open(target_file, 'rb'), content_type=content_type or 'application/octet-stream')

    # Return index.html for root and all client-side SPA routes
    index_file = frontend_dist / 'index.html'
    if index_file.exists():
        with open(index_file, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html; charset=utf-8')

    return HttpResponse(
        """
        <!DOCTYPE html>
        <html>
        <head><title>LANDSAFE-NER | Initializing</title></head>
        <body style="background:#090d16;color:#f8fafc;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <div style="text-align:center;max-width:500px;padding:30px;background:#1e293b;border-radius:12px;border:1px solid #ea580c;">
                <h2 style="color:#ea580c;">🏔️ LANDSAFE-NER</h2>
                <p>System is initializing and compiling frontend assets.</p>
                <p style="color:#94a3b8;font-size:0.85rem;">Please refresh this page in a few seconds.</p>
            </div>
        </body>
        </html>
        """,
        content_type='text/html'
    )
