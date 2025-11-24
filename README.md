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
