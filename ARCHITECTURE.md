# Architectural Design & Call Stack Execution Diagrams

This repository contains Unit 2: Project 2 (Listicle Part 2) for CodePath Advanced Web Development (WEB103).

## System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  Vanilla HTML5 / CSS3 / ES6 JS (No Frameworks)                                    |
|  - client/index.html                                                              |
|  - client/src/css/style.css                                                       |
|  - client/src/js/app.js (Fetch API, DOM Event Handlers, Modal, Search Input)     |
+----------------------------------------+------------------------------------------+
                                         | HTTP GET /api/items?q=...
                                         v
+-----------------------------------------------------------------------------------+
|                                  SERVER LAYER                                     |
|  Node.js / Express Web Server                                                     |
|  - server/server.js (Static File Middleware, CORS, Express JSON)                  |
|  - server/routes/items.js (API Routing)                                           |
|  - server/controllers/items.js (Query Logic & Route Handlers)                     |
+----------------------------------------+------------------------------------------+
                                         | SQL Queries (pg Pool Socket)
                                         v
+-----------------------------------------------------------------------------------+
|                                 DATABASE LAYER                                    |
|  PostgreSQL Database (`listicle_db`)                                              |
|  - Table: `items` (id, title, description, category, image_url, rating)            |
+-----------------------------------------------------------------------------------+
```

---

## 6-Tier Granular Call Stack Traces

### Trace 1: Server Startup & Database Seeding (`server/config/reset.js`)

```
Execution Call Stack Trace:
└── [Project] Node.js Execution Context (`npm run reset`)
    ├── [Configuration/Env] Invariants Loaded: PORT=5000, DATABASE_URL=postgres://postgres:postgres@localhost:5432/listicle_db
    └── [Folder] server/config/
        └── [File] reset.js
            └── [Class/Module] PostgreSQL Pool (`pg.Pool`)
                └── [Method] seedTable()
                    ├── [Variable State Shift] SQL Statement: `DROP TABLE IF EXISTS items; CREATE TABLE items (...)`
                    ├── [Variable State Shift] Mutated Database Schema: Table `items` created with 6 columns
                    └── [Method] pool.query(insertQuery, values) [Loop over 10 items]
                        ├── [Variable State Shift] Item Payload: { title: "Artificial Intelligence & Generative LLMs", rating: 5.0, ... }
                        └── [Project] PostgreSQL TCP Socket Connection (`localhost:5432`)
```

### Trace 2: Dynamic Search Query Execution (`GET /api/items?q=quantum`)

```
Execution Call Stack Trace:
└── [Project] Web Browser Request (`GET /api/items?q=quantum`)
    ├── [Configuration/Env] Express Middleware Stack (`cors()`, `express.static()`)
    └── [Folder] server/routes/
        └── [File] items.js
            └── [Class/Module] ItemController Module
                └── [Method] getItems(req, res)
                    ├── [Variable State Shift] req.query.q = "quantum"
                    ├── [Variable State Shift] queryText = "SELECT * FROM items WHERE title ILIKE $1 OR description ILIKE $1 OR category ILIKE $1 ORDER BY id ASC"
                    ├── [Variable State Shift] queryParams = ["%quantum%"]
                    └── [Method] pool.query(queryText, queryParams)
                        ├── [Variable State Shift] Database Output: result.rows = [{ id: 2, title: "Quantum Computing", ... }]
                        └── [Project] HTTP Response Payload: 200 OK JSON `[{"id":2,"title":"Quantum Computing",...}]`
```

### Trace 3: Client Search & Dynamic DOM Render

```
Execution Call Stack Trace:
└── [Project] Browser Event (`input#search-input` keyup: "quantum")
    ├── [Folder] client/src/js/
        └── [File] app.js
            └── [Class/Module] DOM Application Event Loop
                └── [Method] fetchItems()
                    ├── [Variable State Shift] searchInput.value = "quantum"
                    ├── [Variable State Shift] Target URL = "/api/items?q=quantum"
                    └── [Method] fetch(url) -> await response.json()
                        ├── [Variable State Shift] allItems = [{ id: 2, title: "Quantum Computing", ... }]
                        └── [Method] filterAndRenderItems()
                            ├── [Variable State Shift] DOM Mutation: itemsContainer.innerHTML updated with filtered card HTML
                            └── [Project] Rendered Card Display in User Browser
```
