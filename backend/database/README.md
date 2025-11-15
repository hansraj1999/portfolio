# MongoDB Setup for Portfolio Backend

## Environment Variables

Add these to your `.env` file:

```env
# Option 1: Full MongoDB URI (recommended)
MONGODB_URI=mongodb://username:password@host:port/database?authSource=admin

# Option 2: Individual connection parameters
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_USERNAME=your_username
MONGODB_PASSWORD=your_password
MONGODB_DATABASE=portfolio
```

## Quick Start

1. **See example documents**: Check `blog_example.json` for JSON examples
2. **Insert sample data**: Run `insert_blog_examples.js` in MongoDB shell
3. **Read full schema**: See `BLOG_SCHEMA.md` for detailed documentation

## Blog Collection Structure

The `blogs` collection should have documents with the following structure:

```json
{
  "_id": ObjectId("..."),
  "title": "Blog Post Title",
  "description": "Short description of the blog post",
  "tags": ["tag1", "tag2", "tag3"],
  "link": "https://medium.com/@hansraj/blog-post-url",
  "created_at": ISODate("2024-01-15T10:30:00Z"),
  "published": true
}
```

### Required Fields
- `title` (String): Blog post title
- `published` (Boolean): `true` to show, `false` to hide (draft)

### Optional Fields
- `description` (String): Short description/summary
- `tags` (Array): Array of tag strings
- `link` (String): URL to full blog post
- `created_at` (Date): Publication date (used for sorting)

## Insert Sample Data

### Option 1: Using MongoDB Shell Script

```bash
# In MongoDB shell
mongosh
use portfolio
load("insert_blog_examples.js")
```

### Option 2: Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to your database
3. Select `portfolio` database → `blogs` collection
4. Click "Add Data" → "Insert Document"
5. Copy from `blog_example.json` and paste (remove `_id` field - it's auto-generated)

### Option 3: Manual Insert

```javascript
use portfolio

db.blogs.insertOne({
  "title": "Your Blog Title",
  "description": "Your blog description",
  "tags": ["tag1", "tag2"],
  "link": "https://medium.com/@hansraj/your-blog-url",
  "created_at": new Date(),
  "published": true
})
```

## API Endpoint

The blog endpoint supports pagination:

- `GET /api/blog?limit=10&skip=0` - Fetch blogs with pagination
  - `limit`: Number of posts to return (default: 10, max: 100)
  - `skip`: Number of posts to skip for pagination (default: 0)

## Response Format

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title": "Blog Post Title",
    "description": "Short description",
    "tags": ["tag1", "tag2"],
    "link": "https://medium.com/@hansraj/blog-url",
    "created_at": "2024-01-15T10:30:00",
    "published": true
  }
]
```

