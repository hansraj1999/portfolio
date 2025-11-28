# Backend Engineer Portfolio

A modern, responsive portfolio website for backend engineers showcasing projects, blog posts, and interactive demos. Features a clean design with live demos of distributed systems projects.

## Features

- 🎨 Modern, responsive design with dark theme
- 🚀 Fast and lightweight (vanilla JavaScript)
- 📱 Mobile-friendly and accessible
- 🔗 Integrated with FastAPI backend
- 📧 Contact form with email support
- 🎯 Smooth scrolling and animations
- 🎮 Interactive live demos:
  - **EphemeralChat**: Real-time ephemeral chat rooms with WebSocket
  - **ShortURL**: Distributed URL shortening service
- 🔍 SEO optimized with structured data (JSON-LD)
- 📊 Analytics-ready
- 🌐 Deployed on Vercel

## Project Structure

```
portfolio/
├── backend/
│   ├── app.py              # FastAPI backend server
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Docker configuration
│   ├── database/           # MongoDB schemas and examples
│   └── communications/     # Email service
├── index.html              # Main portfolio page
├── blogs.html              # Blog listing page
├── ephemeralchat.html      # EphemeralChat live demo
├── shorturl.html           # ShortURL live demo
├── styles.css              # Global styling
├── script.js               # Frontend JavaScript
├── config.js               # API configuration
├── vercel.json             # Vercel deployment config
├── sitemap.xml             # SEO sitemap
├── robots.txt              # SEO robots file
├── images/                 # Images and logos
│   └── logos/              # Technology logos (offline)
└── README.md               # This file
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv .venv
   ```

3. Activate the virtual environment:
   - Windows: `.venv\Scripts\activate`
   - Mac/Linux: `source .venv/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file in the `backend` directory (optional, for email functionality):
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=your-email@gmail.com
   TO_EMAIL=your-email@gmail.com
   FRONTEND_URL=http://localhost:3001
   ```

6. Run the backend server:
   ```bash
   uvicorn app:app --reload --port 3001
   ```

   Or use Python directly:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Simply open `index.html` in a web browser, or use a local server:

   **Using Python:**
   ```bash
   python -m http.server 8000
   ```

   **Using Node.js (http-server):**
   ```bash
   npx http-server -p 8000
   ```

2. Open `http://localhost:8000` in your browser

3. **Important:** Update the API URL in `script.js` if your backend runs on a different port:
   ```javascript
   const API_BASE_URL = 'http://localhost:3001/api';
   ```

## Demo Pages

### EphemeralChat Demo (`ephemeralchat.html`)
- Real-time ephemeral chat rooms with WebSocket
- Room creation and joining
- Auto-expiring rooms with TTL
- Password protection
- User presence tracking
- Retry logic for Cloud Run cold starts
- Features: `destroy_on_owner_offline` option

### ShortURL Demo (`shorturl.html`)
- Distributed URL shortening service
- Real-time analytics
- Architecture visualization
- Request flow diagram

## Customization

### Update Your Information

1. **About Section**: Edit the text in `index.html`
2. **Skills**: Modify the skill tags in `index.html`
3. **Projects**: Update projects in `backend/app.py` or MongoDB
4. **Blog Posts**: Update blog posts in `backend/app.py` or MongoDB
5. **Contact Email**: Update the email in `index.html`
6. **API Configuration**: Update `config.js` with your API endpoints

### Styling

- Colors: Edit CSS variables in `styles.css`
- Fonts: Change the Google Fonts import in `index.html`
- Theme: Dark theme with green accent color (`#a3e635`)

### SEO Configuration

- Meta tags: Update in `index.html` head section
- Structured data: JSON-LD schemas for Person and WebSite
- Sitemap: Update `sitemap.xml` with new pages
- Open Graph: Configure OG tags for social sharing

## API Endpoints

The backend provides the following endpoints:

- `GET /api/projects` - Returns list of projects
- `GET /api/blog` - Returns list of blog posts
- `POST /api/contact` - Submit contact form
- `GET /api/seo/og?title=...` - Generate OG image
- `GET /healthz` - Health check

### External APIs Used

- **EphemeralChat API**: `https://ephemeralchat.hansraj.me`
- **ShortURL API**: Configured in `config.js`

## Deployment

### Vercel Deployment

The site is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the configuration
3. Routes are configured in `vercel.json`:
   - `/` → `index.html`
   - `/blogs` → `blogs.html`
   - `/shorturl` → `shorturl.html`
   - `/ephemeralchat` → `ephemeralchat.html`

See `DEPLOY.md` for detailed deployment instructions.

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: FastAPI, Python
- **Database**: MongoDB
- **Styling**: Custom CSS with CSS Variables
- **Fonts**: Inter (Google Fonts)
- **Deployment**: Vercel
- **WebSockets**: Real-time communication for chat
- **SEO**: Structured data (JSON-LD), Open Graph, Twitter Cards

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Key Features Implemented

### SEO Optimization
- ✅ Structured data (JSON-LD) for Person and WebSite
- ✅ Open Graph tags for social sharing
- ✅ Twitter Card support
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Canonical URLs
- ✅ Meta keywords and descriptions

### Performance
- ✅ Offline logo storage (no external CDN dependencies)
- ✅ Optimized images
- ✅ Fast page loads

### User Experience
- ✅ Retry logic for Cloud Run cold starts
- ✅ Error handling with user-friendly popups
- ✅ Loading states and feedback
- ✅ Responsive design
- ✅ Accessibility considerations

## Contributing

Feel free to fork this project and customize it for your own portfolio!

## License

Feel free to use this portfolio template for your own projects!

## Author

**Hansraj Deghun**
- Portfolio: https://hansraj.me
- LinkedIn: https://www.linkedin.com/in/hansraj-deghun
- GitHub: https://github.com/hansraj1999

