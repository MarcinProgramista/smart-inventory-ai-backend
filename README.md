🚀 SmartInventoryAI — Backend

SmartInventoryAI is an advanced warehouse & inventory management backend built with Node.js, Express, and PostgreSQL, with planned AI-powered predictions for stock, demand, and anomalies.

🔧 Tech Stack

Node.js (ES Modules)

Express.js

PostgreSQL

pg (native driver)

CORS

dotenv

bcrypt

AI Integration (Gemini/OpenAI) — planned

Rich logging & error handling

📌 Core Features

```
✔ REST API for inventory and warehouse operations
✔ User system with roles
✔ Items, categories, stock, locations
✔ Request logging (UUID + timestamp)
✔ Global error handler
✔ CORS security layer
✔ Database health checks
✔ Default categories cloned during user registration
```

📁 Project Structure

```
smartinventory-backend/
│
├── config/
│   ├── corsOptions.js         # Allowed domains & CORS rules
│   └── allowedOrigins.js      # List of trusted frontend URLs
│
├── middleware/
│   ├── logger.js              # Logs every incoming request
│   └── errorHandler.js        # Global error handler
│
├── controllers/               # Route handlers (register, items, etc.)
├── routes/                    # API route grouping
│
├── logs/
│   ├── reqLog.txt             # Saved request logs
│   └── errLog.txt             # Saved backend errors
│
├── db.js                      # PostgreSQL client setup & connection
├── server.js                  # Main Express app
├── package.json               # Dependencies & scripts
├── .env.example               # Example environment config
└── README.md                  # Project documentation
```

🔍 Health Check Endpoints

```
Used to monitor production systems:

Endpoint	Meaning
GET /live	Server is running
GET /ready	Checks DB connection
GET /health	Full system health
```

Example /health response:

```
{
  "status": "healthy",
  "db": "connected",
  "time": "2025-01-03T12:41:22.123Z"
}
```

🗄️ Database Setup (PostgreSQL)

1. Create the database

```
createdb smart_inventory
```

2. Create .env file

```
PG_USER=your_user
PG_PASSWORD=your_password
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=smart_inventory

PORT=5000
JWT_SECRET=super_secret_key_12345
```

3. Load the database schema

```
If you have a schema.sql:

psql -U <your_user> -d smart_inventory -f schema.sql


Or run the SQL from this README manually.
```

🗃️ Database Schema Overview

1. users

```
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(300) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    token VARCHAR(200),
    role_id INTEGER NOT NULL DEFAULT 2 REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

Column Description

```
id	Auto-increment user ID
name	Full name
email	Unique login email
password	Hashed password
token	Password reset / auth token
role_id	Role (admin, worker, viewer)
created_at	Timestamp
```

2. roles

```
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);
```

```
INSERT INTO roles VALUES
(1, 'admin'),
(2, 'worker'),
(3, 'viewer');
```

3. category_default

Default categories cloned on user registration.

```
CREATE TABLE category_default (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
```

```
INSERT INTO category_default (name) VALUES
 ('Electronics'),
 ('Office'),
 ('Warehouse'),
 ('Tools'),
 ('Misc');
```

4. categories

```
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);
```

5. locations

```
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT
);
```

6. items

```
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id),
    name VARCHAR(200) NOT NULL,
    quantity INT DEFAULT 0,
    min_quantity INT DEFAULT 0,
    supplier VARCHAR(150),
    price NUMERIC(10,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

7. stock

```
CREATE TABLE stock (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    location_id INTEGER REFERENCES locations(id),
    quantity INTEGER NOT NULL DEFAULT 0
);
```

8. activity_log

```
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

🔐 Registration Workflow

```
User registration (POST /api/register) performs:

Validate request body

Hash password using bcrypt

Insert user into users

Auto-assign role (role_id = 2)
```

Clone default categories:

```
INSERT INTO categories (user_id, name)
SELECT user_id, name FROM category_default


Transaction (BEGIN → COMMIT)
```

▶️ Running the Project

Install dependencies:

```
npm install


Run with nodemon:

npm run dev


Run in production mode:

npm start
```

📮 API Test Tools

Example test request (mini Postman):

```
python3 mini_postman.py requests/register_user.json
```

📌 Roadmap

```
 JWT login + refresh tokens

 AI anomaly detection

 AI stock prediction

 Barcode / QR code support

 Dashboard analytics
```

🔍 Healthcheck Endpoints
The backend provides several endpoints for checking the status of the server and the database:

GET /live
Checks whether the server is running.

Response:

```
{ "status": "ok" }
```

GET /ready
Checks whether the server is ready to handle requests (including database connectivity).

Response (DB OK):

```
{ "status": "ready" }

```

Response (DB DOWN):

```
{ "status": "db-down" }
```

GET /health
Performs a full health check of the application and the database.

Response:

```
{
  "status": "healthy",
  "db": "connected",
  "time": "2025-12-03T12:00:00.000Z"
}
```

🧪 Mini Postman – Testing Endpoints
The project includes Mini Postman — a simple script for sending requests.

Run:

```
python3 mini_postman.py <request.json>

```

Available healthcheck requests:
requests/live.json

requests/ready.json

requests/health.json

Example:

```
python3 mini_postman.py requests/health.json

```

🧑‍💻 Author

SmartInventoryAI Backend —2025

Created by Marcin Czapla
