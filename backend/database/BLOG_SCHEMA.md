# Blog Collection Schema

## Collection Name
`blogs`

## Document Structure

Each blog document should have the following fields:

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `title` | String | Blog post title | "MongoDB Projections & Network Latency" |
| `published` | Boolean | Whether the blog is published | `true` or `false` |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `description` | String | Short description/summary of the blog | "Learn how to optimize MongoDB queries..." |
| `tags` | Array of Strings | Tags/categories for the blog | `["mongodb", "performance"]` |
| `link` | String | URL to the full blog post | "https://medium.com/@hansraj/..." |
| `created_at` | Date/ISODate | Publication date | `ISODate("2024-01-15T10:30:00Z")` |
| `_id` | ObjectId | MongoDB document ID (auto-generated) | `ObjectId("507f1f77bcf86cd799439011")` |

## Example Document

```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "title": "MongoDB Projections & Network Latency",
  "description": "Learn how to optimize MongoDB queries using projections to reduce network latency and improve application performance.",
  "tags": ["mongodb", "performance", "optimization", "database"],
  "link": "https://medium.com/@hansraj/mongodb-projections-network-latency",
  "created_at": ISODate("2024-01-15T10:30:00Z"),
  "published": true
}
```

## Field Details

### `title` (String, Required)
- The main title of the blog post
- Should be descriptive and clear
- Max recommended length: 100 characters

### `description` (String, Optional)
- A brief summary or excerpt of the blog post
- Used for previews and SEO
- Recommended length: 100-300 characters

### `tags` (Array of Strings, Optional)
- Tags for categorizing and searching blogs
- Should be lowercase, hyphenated if multiple words
- Examples: `["mongodb", "performance", "go", "distributed-systems"]`

### `link` (String, Optional)
- Full URL to the blog post (e.g., Medium, personal blog)
- Should be a valid URL
- If empty, the blog card won't show a "Read More" link

### `created_at` (Date, Optional)
- Publication or creation date
- Used for sorting (newest first)
- Should be in ISO 8601 format
- If not provided, blogs will still work but won't be sorted by date

### `published` (Boolean, Required)
- Controls visibility of the blog post
- `true`: Blog is visible in API responses
- `false`: Blog is hidden (draft/unpublished)
- **Only published blogs are returned by the API**

## Inserting Documents

### Using MongoDB Shell

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

### Using MongoDB Compass

1. Connect to your MongoDB instance
2. Select the `portfolio` database
3. Select the `blogs` collection
4. Click "Add Data" → "Insert Document"
5. Paste the JSON document (without `_id` - it will be auto-generated)

### Using Python (Motor)

```python
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.portfolio

blog = {
    "title": "Your Blog Title",
    "description": "Your blog description",
    "tags": ["tag1", "tag2"],
    "link": "https://medium.com/@hansraj/your-blog-url",
    "created_at": datetime.now(),
    "published": True
}

await db.blogs.insert_one(blog)
```

## API Response Format

The API returns blogs in this format:

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "MongoDB Projections & Network Latency",
      "description": "Learn how to optimize...",
      "tags": ["mongodb", "performance"],
      "link": "https://medium.com/@hansraj/...",
      "created_at": "2024-01-15T10:30:00",
      "published": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "skip": 0,
    "total": 25,
    "total_pages": 3,
    "has_next": true,
    "has_previous": false
  }
}
```

## Notes

- The `_id` field is automatically converted to a string in API responses
- Only documents with `published: true` are returned
- Blogs are sorted by `created_at` in descending order (newest first)
- If `created_at` is missing, the blog will still be returned but may appear in an unpredictable order

