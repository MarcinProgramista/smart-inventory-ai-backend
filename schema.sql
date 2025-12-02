-- ROLES
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (id, name) VALUES
(1, 'admin'),
(2, 'worker'),
(3, 'viewer');


-- USERS
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(300) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    token VARCHAR(200),
    role_id INTEGER NOT NULL DEFAULT 2 REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT NOW()
);


-- DEFAULT CATEGORIES (CLONED AT REGISTRATION)
CREATE TABLE category_default (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

INSERT INTO category_default (name) VALUES
 ('Electronics'),
 ('Office'),
 ('Warehouse'),
 ('Tools'),
 ('Misc');


-- USER CATEGORIES
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);


-- LOCATIONS
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT
);


-- ITEMS
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


-- STOCK
CREATE TABLE stock (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    location_id INTEGER REFERENCES locations(id),
    quantity INTEGER NOT NULL DEFAULT 0
);


-- ACTIVITY LOG
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
