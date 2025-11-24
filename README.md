# 🚀 SmartInventoryAI — Backend  
Backend for SmartInventoryAI — an intelligent warehouse & inventory management system built with **Node.js**, **Express**, and **PostgreSQL**, enhanced with AI-powered predictions.

## 🔧 Tech Stack
- Node.js (ES Modules)
- Express.js
- PostgreSQL
- CORS configuration
- Custom logger & error handler
- dotenv
- AI integration (Gemini/OpenAI) — planned

## 📌 Core Features
- Full REST API for inventory management
- User authentication (planned)
- Items, categories, and stock movement endpoints
- Advanced logging system (request logs + error logs)
- Global error handler
- CORS security layer
- Test endpoints:
  - `GET /` — API status
  - `POST /echo` — test JSON response

## 📁 Project Structure
smartinventory-backend/
│
├── config/
│ ├── corsOptions.js # Allowed domains & CORS rules
│ └── allowedOrigins.js # List of trusted frontend URLs
│
├── middleware/
│ ├── logger.js # Logs every incoming request (uuid + timestamp)
│ └── errorHandler.js # Global error handler
│
├── logs/
│ ├── reqLog.txt # Saved request logs
│ └── errLog.txt # Saved backend errors
│
├── server.js # Main server file (Express app)
├── package.json # Dependencies & scripts
├── .gitignore # Ignored files
└── README.md # Project documentation

### 🔍 Health Checks

Backend includes professional health-check endpoints used in production environments:

| Endpoint | Meaning |
|---------|---------|
| **GET /live** | Confirms the server is running |
| **GET /ready** | Checks if server is ready (DB online) |
| **GET /health** | Full health status including DB |

Example response:

```json
{
  "status": "healthy",
  "db": "connected",
  "time": "2025-01-03T12:41:22.123Z"
}

🗄️ Database Schema (PostgreSQL)
Backend uses a relational database designed for inventory, users, and AI features.
Tables Overview

1. users
| Column   | Type                | Description     |
| -------- | ------------------- | --------------- |
| id       | SERIAL PK           | User ID         |
| name     | VARCHAR(50)         | Full name       |
| email    | VARCHAR(300) UNIQUE | Login email     |
| password | VARCHAR(200)        | Hashed password |
| token    | VARCHAR(200)        | Reset token     |
| role_id  | INT FK → roles.id   | User role       |

2. roles
| Column | Type        | Description             |
| ------ | ----------- | ----------------------- |
| id     | SERIAL PK   | Role ID                 |
| name   | VARCHAR(50) | admin / worker / viewer |

3. categories
| Column  | Type              | Description   |
| ------- | ----------------- | ------------- |
| id      | SERIAL PK         |               |
| user_id | INT FK → users.id |               |
| name    | VARCHAR(100)      | Category name |

4. items
| Column       | Type               | Description          |
| ------------ | ------------------ | -------------------- |
| id           | SERIAL PK          |                      |
| user_id      | FK → users.id      |                      |
| category_id  | FK → categories.id |                      |
| name         | VARCHAR(200)       |                      |
| quantity     | INT                |                      |
| min_quantity | INT                | Threshold for alerts |
| supplier     | VARCHAR(150)       |                      |
| price        | NUMERIC(10,2)      |                      |
| description  | TEXT               |                      |

5. stock_movements
| Column     | Type          | Description         |
| ---------- | ------------- | ------------------- |
| id         | SERIAL PK     |                     |
| item_id    | FK → items.id |                     |
| type       | VARCHAR(20)   | incoming / outgoing |
| qty        | INT           |                     |
| created_at | TIMESTAMP     |                     |

6. notifications
| Column     | Type          | Description |
| ---------- | ------------- | ----------- |
| id         | SERIAL PK     |             |
| user_id    | FK → users.id |             |
| message    | TEXT          |             |
| is_read    | BOOLEAN       |             |
| created_at | TIMESTAMP     |             |

