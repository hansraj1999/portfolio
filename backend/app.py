"""
Hansraj Portfolio - FastAPI Backend (single-file)
===============================================

This single-file backend provides:
 - /api/contact    -> contact form (POST)
 - /api/blog       -> blog posts (GET)
 - /api/projects   -> projects list (GET)
 - /api/seo/og     -> dynamic OG image (GET?title=...)

Features:
 - CORS enabled (allow all origins for dev)
 - Contact email sent via SMTP (configurable via env vars)
 - OG image generated using Pillow
 - Simple static blog/projects data (can be replaced by DB later)

Files (this single-file app): app.py

Requirements (put in requirements.txt):
fastapi
uvicorn
python-dotenv
pillow

Optional (if you prefer sending emails via an API):
 - requests (for third-party email APIs)

Environment variables (.env)
----------------------------
Create a file named .env with these values (example):

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
TO_EMAIL=your-email@gmail.com
FRONTEND_URL=http://localhost:5173

Run locally
-----------
1. Create a virtualenv (optional)
   python -m venv .venv
   source .venv/bin/activate   # mac/linux
   .\.venv\Scripts\activate  # windows

2. Install requirements
   pip install -r requirements.txt

3. Run uvicorn
   uvicorn app:app --reload --port 3001

API examples
------------
POST /api/contact
{ "name": "Alice", "email": "alice@example.com", "message": "Hello" }

GET /api/seo/og?title=Hello%20World

"""

import os
from io import BytesIO
from typing import List
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, BackgroundTasks, HTTPException, Request, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, EmailStr
from PIL import Image, ImageDraw, ImageFont
from communications.email import lifespan as email_lifespan, send_email
from database import connect_to_mongodb, close_mongodb_connection, get_blogs_collection, get_projects_collection
from contextlib import asynccontextmanager

# Load env
load_dotenv()
FRONTEND_URL = os.getenv('FRONTEND_URL') or '*'


@asynccontextmanager
async def lifespan(app):
    """Combined lifespan for email and MongoDB connections."""
    # Start email connection
    async with email_lifespan(app):
        # Connect to MongoDB
        await connect_to_mongodb()
        
        yield  # App runs here
        
        # Close MongoDB connection
        await close_mongodb_connection()


app = FastAPI(title="Hansraj Portfolio API", lifespan=lifespan)

# CORS - Must be configured before routes to handle preflight requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# --- Models ---
class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str

# --- Services ---

def generate_og_image(title: str = "Hansraj — Backend Engineer") -> BytesIO:
    """Generate a simple OG image (1200x630) with title text. Returns BytesIO buffer."""
    W, H = 1200, 630
    background_color = (12, 12, 13)
    accent = (168, 85, 247)  # purple

    img = Image.new("RGB", (W, H), color=background_color)
    draw = ImageDraw.Draw(img)

    # Try to load a TTF font; fallback to default
    try:
        font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        title_font = ImageFont.truetype(font_path, 64)
        small_font = ImageFont.truetype(font_path, 28)
    except Exception:
        title_font = ImageFont.load_default()
        small_font = ImageFont.load_default()

    # Accent bar
    draw.rectangle([(0, 0), (W, 140)], fill=accent)

    # Title text
    text = title
    # wrap if necessary
    max_width = W - 120
    # naive wrap
    lines = []
    words = text.split()
    cur = ""
    for w in words:
        test = (cur + " " + w).strip()
        size = draw.textsize(test, font=title_font)
        if size[0] <= max_width:
            cur = test
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)

    y = 180
    for line in lines:
        w, h = draw.textsize(line, font=title_font)
        draw.text(((W - w) / 2, y), line, font=title_font, fill=(255, 255, 255))
        y += h + 10

    # Footer
    footer = "hansraj.dev — Backend Engineer"
    fw, fh = draw.textsize(footer, font=small_font)
    draw.text(((W - fw) / 2, H - fh - 40), footer, font=small_font, fill=(180, 180, 180))

    buf = BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return buf

# --- Routers ---
contact_router = APIRouter()

@contact_router.options("")
@contact_router.options("/")
async def contact_options():
    """Handle OPTIONS preflight for contact endpoint."""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "3600",
        }
    )

@contact_router.post("")
@contact_router.post("/")
async def contact_endpoint(payload: ContactRequest, background_tasks: BackgroundTasks, request: Request):
    # Basic spam protection: require referer or origin from FRONTEND_URL in prod
    origin = request.headers.get('origin') or request.headers.get('referer')
    # In dev we allow everything; in prod you might check origin

    subject = f"Portfolio Contact: {payload.name} <{payload.email}>"
    body = f"Name: {payload.name}\nEmail: {payload.email}\n\nMessage:\n{payload.message}\n"

    # schedule sending email in background
    await send_email("deghun@gmail.com", subject, body)

    return {"status": "ok", "message": "Thanks! Your message has been received."}

# Blog and projects
blog_router = APIRouter()

@blog_router.options("")
@blog_router.options("/")
async def blog_options():
    """Handle OPTIONS preflight for blog endpoint."""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "3600",
        }
    )

@blog_router.get("")
@blog_router.get("/")
async def list_blogs(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(10, ge=1, le=100, description="Number of posts per page"),
    skip: int = Query(None, ge=0, description="Number of posts to skip (alternative to page)")
):
    """
    Fetch blog posts from MongoDB with pagination.
    
    Query parameters:
    - page: Page number (default: 1, 1-indexed). Ignored if skip is provided.
    - limit: Number of posts per page (default: 10, max: 100)
    - skip: Number of posts to skip (alternative to page parameter)
    
    Returns paginated blog posts with metadata.
    """
    try:
        blogs_collection = get_blogs_collection()
        
        # Calculate skip value
        if skip is not None:
            # Use skip if provided
            calculated_skip = skip
            current_page = (skip // limit) + 1
        else:
            # Use page number
            calculated_skip = (page - 1) * limit
            current_page = page
        
        # Get total count of published blogs
        total_count = await blogs_collection.count_documents({"published": True})
        
        # Calculate total pages
        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 0
        
        # Fetch blogs from MongoDB, sorted by date (newest first), only published
        cursor = blogs_collection.find({"published": True}).sort("created_at", -1).skip(calculated_skip).limit(limit)
        blogs = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string and format response
        from datetime import datetime
        formatted_blogs = []
        for blog in blogs:
            created_at = blog.get("created_at")
            if created_at and isinstance(created_at, datetime):
                created_at = created_at.isoformat()
            elif created_at:
                created_at = str(created_at)
            else:
                created_at = None
                
            formatted_blog = {
                "id": str(blog.get("_id", "")),
                "title": blog.get("title", ""),
                "description": blog.get("description", ""),
                "tags": blog.get("tags", []),
                "link": blog.get("link", ""),
                "created_at": created_at,
                "published": blog.get("published", True)
            }
            formatted_blogs.append(formatted_blog)
        
        # Return paginated response with metadata
        return {
            "data": formatted_blogs,
            "count": total_count,
            "pagination": {
                "page": current_page,
                "limit": limit,
                "skip": calculated_skip,
                "total": total_count,
                "total_pages": total_pages,
                "has_next": current_page < total_pages,
                "has_previous": current_page > 1
            }
        }
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error fetching blogs from MongoDB: {e}")
        # Fallback to empty response if MongoDB fails
        fallback_page = page if skip is None else ((skip // limit) + 1 if skip is not None else 1)
        fallback_skip = (page - 1) * limit if skip is None else (skip if skip is not None else 0)
        return {
            "data": [],
            "pagination": {
                "page": fallback_page,
                "limit": limit,
                "skip": fallback_skip,
                "total": 0,
                "total_pages": 0,
                "has_next": False,
                "has_previous": False
            }
        }

projects_router = APIRouter()

@projects_router.options("")
@projects_router.options("/")
async def projects_options():
    """Handle OPTIONS preflight for projects endpoint."""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "3600",
        }
    )

@projects_router.get("")
@projects_router.get("/")
async def list_projects():
    """
    Fetch projects from MongoDB.
    
    Returns list of projects with fields: title, desc, github_link, live_demo_link
    Maps to frontend format: name, desc, github_url, demo_url
    """
    try:
        projects_collection = get_projects_collection()
        
        # Fetch all published projects from MongoDB, sorted by created_at (newest first)
        cursor = projects_collection.find({"published": True}).sort("created_at", -1)
        projects = await cursor.to_list(length=None)  # Get all projects
        
        # Convert ObjectId to string and format response
        formatted_projects = []
        for project in projects:
            formatted_project = {
                "name": project.get("title", ""),  # Map title to name for frontend
                "desc": project.get("desc", ""),
                "github_url": project.get("github_link", ""),  # Map github_link to github_url
                "demo_url": project.get("live_demo_link", ""),  # Map live_demo_link to demo_url
            }
            
            # Include optional fields if they exist
            if project.get("details"):
                formatted_project["details"] = project.get("details")
            if project.get("technologies"):
                formatted_project["technologies"] = project.get("technologies")
            if project.get("features"):
                formatted_project["features"] = project.get("features")
            
            # Legacy support: if url exists and no github_url, use it
            if not formatted_project["github_url"] and project.get("url"):
                formatted_project["github_url"] = project.get("url")
            
            formatted_projects.append(formatted_project)
        
        return formatted_projects
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error fetching projects from MongoDB: {e}")
        # Fallback to empty list if MongoDB fails
        return []

seo_router = APIRouter()

@seo_router.get('/og')
async def og_image(title: str = Query("Hansraj — Backend Engineer", max_length=120)):
    buf = generate_og_image(title)
    return StreamingResponse(buf, media_type="image/png")

# Mount routers
app.include_router(contact_router, prefix="/api/contact", tags=["contact"])
app.include_router(blog_router, prefix="/api/blog", tags=["blog"])
app.include_router(projects_router, prefix="/api/projects", tags=["projects"])
app.include_router(seo_router, prefix="/api/seo", tags=["seo"])

# Explicit OPTIONS handler for all API routes to handle preflight requests
# This prevents redirects during preflight which breaks CORS
# Note: This is a fallback for routes that don't have explicit OPTIONS handlers
@app.options("/api/{path:path}")
async def options_handler(path: str):
    """Handle OPTIONS preflight requests explicitly to avoid redirects."""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "3600",
        }
    )

# Health
@app.get("/healthz")
async def health():
    return {"status": "ok"}

# If run as script
if __name__ == '__main__':
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=3001, reload=True)
