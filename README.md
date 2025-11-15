# Backend Engineer Portfolio

A modern, responsive portfolio website for backend engineers. Features a clean design with sections for projects, blog posts, and contact form.

## Features

- 🎨 Modern, responsive design
- 🚀 Fast and lightweight
- 📱 Mobile-friendly
- 🔗 Integrated with FastAPI backend
- 📧 Contact form with email support
- 🎯 Smooth scrolling and animations

## Project Structure

```
portfolio/
├── backend/
│   ├── app.py              # FastAPI backend server
│   └── requirements.txt    # Python dependencies
├── index.html              # Main HTML file
├── styles.css              # Styling
├── script.js               # Frontend JavaScript
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

## Customization

### Update Your Information

1. **About Section**: Edit the text in `index.html` (lines ~50-60)
2. **Skills**: Modify the skill tags in `index.html` (lines ~65-75)
3. **Projects**: Update projects in `backend/app.py` (lines ~217-223)
4. **Blog Posts**: Update blog posts in `backend/app.py` (lines ~207-213)
5. **Contact Email**: Update the email in `index.html` (line ~95)

### Styling

- Colors: Edit CSS variables in `styles.css` (lines ~1-10)
- Fonts: Change the Google Fonts import in `index.html` (line ~9)

## API Endpoints

The backend provides the following endpoints:

- `GET /api/projects` - Returns list of projects
- `GET /api/blog` - Returns list of blog posts
- `POST /api/contact` - Submit contact form
- `GET /api/seo/og?title=...` - Generate OG image
- `GET /healthz` - Health check

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: FastAPI, Python
- **Styling**: Custom CSS with CSS Variables
- **Fonts**: Inter (Google Fonts)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Feel free to use this portfolio template for your own projects!

