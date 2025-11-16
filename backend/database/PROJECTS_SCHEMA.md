# Projects Collection Schema

## Collection Name
`projects`

## Document Structure

Each project document should have the following fields:

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `title` | String | Project title/name | "FranzMQ" |
| `published` | Boolean | Whether the project is published | `true` or `false` |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `desc` | String | Project description | "Kafka-like messaging queue built in Go" |
| `github_link` | String | GitHub repository URL | "https://github.com/hansraj/franzmq" |
| `live_demo_link` | String | Live demo URL | "https://franzmq-demo.vercel.app" |
| `details` | String | Additional project details | "A distributed message queue system..." |
| `technologies` | Array of Strings | Technologies used | `["Go", "Kafka", "Distributed Systems"]` |
| `features` | Array of Strings | Project features | `["Partitioning", "Replication", "Consumer Groups"]` |
| `created_at` | Date/ISODate | Creation date | `ISODate("2024-01-15T10:30:00Z")` |
| `_id` | ObjectId | MongoDB document ID (auto-generated) | `ObjectId("507f1f77bcf86cd799439011")` |

## Example Document

```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "title": "FranzMQ",
  "desc": "Kafka-like messaging queue built in Go",
  "github_link": "https://github.com/hansraj/franzmq",
  "live_demo_link": "https://franzmq-demo.vercel.app",
  "details": "A distributed message queue system inspired by Apache Kafka, built from scratch in Go.",
  "technologies": ["Go", "Kafka", "Distributed Systems", "Message Queue"],
  "features": ["Partitioning", "Replication", "Consumer Groups", "High Throughput"],
  "created_at": ISODate("2024-01-15T10:30:00Z"),
  "published": true
}
```

## Field Details

### `title` (String, Required)
- The project name/title
- Should be descriptive and clear
- Max recommended length: 100 characters

### `desc` (String, Optional)
- A brief description of the project
- Used for project card previews
- Recommended length: 50-200 characters

### `github_link` (String, Optional)
- GitHub repository URL
- Should be a valid URL
- If empty, GitHub button won't show on project card

### `live_demo_link` (String, Optional)
- Live demo URL
- Should be a valid URL
- If empty, Live Demo button won't show on project card

### `details` (String, Optional)
- Additional project details
- Shown in the project details modal
- Can be longer than the description

### `technologies` (Array of Strings, Optional)
- List of technologies used in the project
- Displayed as tags in the details modal
- Examples: `["Go", "Python", "Kafka", "Docker", "Kubernetes"]`

### `features` (Array of Strings, Optional)
- List of project features
- Displayed as a bulleted list in the details modal
- Examples: `["High Performance", "Scalable", "Distributed"]`

### `created_at` (Date, Optional)
- Creation or publication date
- Used for sorting (newest first)
- Should be in ISO 8601 format
- If not provided, projects will still work but won't be sorted by date

### `published` (Boolean, Required)
- Controls visibility of the project
- `true`: Project is visible in API responses
- `false`: Project is hidden (draft/unpublished)
- **Only published projects are returned by the API**

## Inserting Documents

### Using MongoDB Shell

```javascript
use portfolio

db.projects.insertOne({
  "title": "Your Project Title",
  "desc": "Your project description",
  "github_link": "https://github.com/username/project",
  "live_demo_link": "https://your-demo.vercel.app",
  "details": "Additional project details...",
  "technologies": ["Technology1", "Technology2"],
  "features": ["Feature1", "Feature2"],
  "created_at": new Date(),
  "published": true
})
```

### Using MongoDB Compass

1. Connect to your MongoDB instance
2. Select the `portfolio` database
3. Select the `projects` collection
4. Click "Add Data" → "Insert Document"
5. Paste the JSON document (without `_id` - it will be auto-generated)

### Using Python (Motor)

```python
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.portfolio

project = {
    "title": "Your Project Title",
    "desc": "Your project description",
    "github_link": "https://github.com/username/project",
    "live_demo_link": "https://your-demo.vercel.app",
    "details": "Additional project details...",
    "technologies": ["Technology1", "Technology2"],
    "features": ["Feature1", "Feature2"],
    "created_at": datetime.now(),
    "published": True
}

await db.projects.insert_one(project)
```

## API Response Format

The API returns projects in this format:

```json
[
  {
    "name": "FranzMQ",
    "desc": "Kafka-like messaging queue built in Go",
    "github_url": "https://github.com/hansraj/franzmq",
    "demo_url": "https://franzmq-demo.vercel.app",
    "details": "A distributed message queue system...",
    "technologies": ["Go", "Kafka", "Distributed Systems"],
    "features": ["Partitioning", "Replication", "Consumer Groups"]
  }
]
```

**Note:** The API maps database fields to frontend-friendly names:
- `title` → `name`
- `github_link` → `github_url`
- `live_demo_link` → `demo_url`

## Notes

- The `_id` field is automatically converted to a string in API responses (if needed)
- Only documents with `published: true` are returned
- Projects are sorted by `created_at` in descending order (newest first)
- If `created_at` is missing, the project will still be returned but may appear in an unpredictable order
- If both `github_link` and legacy `url` field exist, `github_link` takes precedence

