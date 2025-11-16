// MongoDB Shell Script to Insert Example Project Documents
// Run this in MongoDB shell or MongoDB Compass

use portfolio

// Clear existing projects (optional - be careful!)
// db.projects.deleteMany({})

// Insert example project documents
db.projects.insertMany([
  {
    "title": "FranzMQ",
    "desc": "Kafka-like messaging queue built in Go",
    "github_link": "https://github.com/hansraj/franzmq",
    "live_demo_link": "",
    "details": "A distributed message queue system inspired by Apache Kafka, built from scratch in Go. Features partitioning, replication, and consumer groups for high-throughput message processing.",
    "technologies": ["Go", "Kafka", "Distributed Systems", "Message Queue"],
    "features": [
      "Partitioning for horizontal scaling",
      "Replication for fault tolerance",
      "Consumer groups for load balancing",
      "High throughput message processing"
    ],
    "created_at": new Date("2024-01-15T10:30:00Z"),
    "published": true
  },
  {
    "title": "Bitcask-Clone",
    "desc": "Bitcask-style KV store in Go",
    "github_link": "https://github.com/hansraj/bitcask-go",
    "live_demo_link": "",
    "details": "A key-value store implementation in Go, inspired by Bitcask. Provides fast writes and efficient storage with append-only log structure.",
    "technologies": ["Go", "Key-Value Store", "File System"],
    "features": [
      "Append-only log structure",
      "Fast write operations",
      "Efficient storage",
      "Simple API"
    ],
    "created_at": new Date("2024-02-20T14:15:00Z"),
    "published": true
  }
])

