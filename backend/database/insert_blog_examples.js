// MongoDB Shell Script to Insert Example Blog Documents
// Run this in MongoDB shell or MongoDB Compass

use portfolio

// Clear existing blogs (optional - be careful!)
// db.blogs.deleteMany({})

// Insert example blog documents
db.blogs.insertMany([
  {
    "title": "MongoDB Projections & Network Latency",
    "description": "Learn how to optimize MongoDB queries using projections to reduce network latency and improve application performance. This article covers best practices for selecting only the fields you need.",
    "tags": ["mongodb", "performance", "optimization", "database"],
    "link": "https://medium.com/@hansraj/mongodb-projections-network-latency",
    "created_at": new Date("2024-01-15T10:30:00Z"),
    "published": true
  },
  {
    "title": "Building FranzMQ: A Kafka-like Queue in Go",
    "description": "A deep dive into building a distributed message queue system in Go, inspired by Apache Kafka. Learn about partitioning, replication, and consumer groups.",
    "tags": ["go", "kafka", "distributed-systems", "message-queue"],
    "link": "https://medium.com/@hansraj/building-franzmq-a-kafka-like-queue",
    "created_at": new Date("2024-02-20T14:15:00Z"),
    "published": true
  },
  {
    "title": "Scaling Order Management Systems",
    "description": "How we scaled the Order Management System at Fynd to handle 2M+ orders daily. Architecture decisions, challenges, and lessons learned.",
    "tags": ["scalability", "microservices", "architecture", "orders"],
    "link": "https://medium.com/@hansraj/scaling-order-management-systems",
    "created_at": new Date("2024-03-10T09:00:00Z"),
    "published": true
  },
  {
    "title": "Optimizing High-Throughput Systems with Redis",
    "description": "Using Redis for caching and session management in high-throughput systems. Patterns, pitfalls, and performance tips.",
    "tags": ["redis", "caching", "performance", "high-throughput"],
    "link": "https://medium.com/@hansraj/optimizing-high-throughput-systems-redis",
    "created_at": new Date("2024-04-05T16:45:00Z"),
    "published": true
  },
  {
    "title": "Microservices Communication Patterns",
    "description": "Exploring different communication patterns in microservices architecture: synchronous vs asynchronous, event-driven patterns, and API gateways.",
    "tags": ["microservices", "architecture", "communication", "patterns"],
    "link": "https://medium.com/@hansraj/microservices-communication-patterns",
    "created_at": new Date("2024-05-12T11:20:00Z"),
    "published": true
  },
  {
    "title": "Docker & Kubernetes Best Practices",
    "description": "Best practices for containerizing applications with Docker and orchestrating them with Kubernetes. Tips for production deployments.",
    "tags": ["docker", "kubernetes", "devops", "containers"],
    "link": "https://medium.com/@hansraj/docker-kubernetes-best-practices",
    "created_at": new Date("2024-06-01T08:30:00Z"),
    "published": true
  }
])

// Verify insertion
print("Total blogs inserted: " + db.blogs.countDocuments({}))
print("Published blogs: " + db.blogs.countDocuments({published: true}))

