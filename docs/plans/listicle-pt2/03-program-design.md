# Program Design & Call Stack Execution Traces: Listicle Part 2

This document details the architectural design, folder structure, module boundaries, and multi-tier call stack execution traces for the Listicle Part 2 application.

## 1. Project & Folder Architecture Map

```
web103-unit2-listicle/
├── .env.example                     <- Environment variable template (PORT, DATABASE_URL)
├── .gitignore                       <- Git ignore rules for node_modules, .env, and logs
├── package.json                     <- Project metadata, scripts, and dependencies (express, pg, cors, dotenv)
├── client/                          <- Vanilla Frontend Application
│   ├── index.html                   <- Main HTML structure with search, category filters, and modal
│   └── src/
│       ├── css/
│       │   └── style.css            <- Responsive dark-mode styling with Flexbox/Grid
│       └── js/
│           └── app.js               <- Client SPA controller, fetch API calls, and DOM renderer
└── server/                          <- Node.js / Express Backend
    ├── server.js                    <- Express application entry point & static file server
    ├── config/
    │   ├── database.js              <- PostgreSQL pool configuration via pg module
    │   └── reset.js                 <- Database table creation & seeding script
    ├── controllers/
    │   └── items.js                 <- SQL Query handlers (getItems, getItemById)
    ├── routes/
    │   └── items.js                 <- Express Router for /api/items endpoints
    └── tests/
        └── items.test.js            <- Automated backend integration tests
```

---

## 2. 6-Tier Call Stack Execution Traces

### Trace A: Startup & Database Reset Execution Flow

```
Execution Call Stack Trace:
└── [Project] Web Browser / CLI Process Entry Point (`npm run reset`)
    ├── [Configuration/Env] Invariants Loaded: PORT=5000, DATABASE_URL=postgres://postgres:postgres@localhost:5432/listicle_db
    └── [Folder] server/config/
        └── [File] reset.js
            └── [Class/Module] PostgreSQL Pool Object (`pg.Pool`)
                └── [Method] seedTable()
                    ├── [Variable State Shift] Inbound SQL Query: `DROP TABLE IF EXISTS items; CREATE TABLE items (...)`
                    ├── [Variable State Shift] Mutated Database State: Table `items` dropped and recreated with 6 columns
                    └── [Method] pool.query(insertQuery, values) [Loop 1..10]
                        ├── [Variable State Shift] Inbound Param: item = { title: "Artificial Intelligence & Generative LLMs", rating: 5.0, ... }
                        ├── [Variable State Shift] Mutated Result: Inserted Row ID #1 into PostgreSQL `items` table
                        └── [Project] Remote/Local PostgreSQL TCP Socket Connection (`localhost:5432`)
```

---

### Trace B: Server-Side Search Request (`GET /api/items?q=quantum`)

```
Execution Call Stack Trace:
└── [Project] Web Browser HTTP GET Request (`http://localhost:5000/api/items?q=quantum`)
    ├── [Configuration/Env] Express Middleware Stack: `cors()`, `express.json()`, `express.static('client')`
    └── [Folder] server/routes/
        └── [File] items.js (Express Router)
            └── [Class/Module] ItemController Module
                └── [Method] getItems(req, res)
                    ├── [Variable State Shift] Inbound Param: req.query.q = "quantum"
                    ├── [Variable State Shift] Query Transformation: queryText = "SELECT * FROM items WHERE title ILIKE $1 OR description ILIKE $1 OR category ILIKE $1 ORDER BY id ASC"
                    ├── [Variable State Shift] Query Params: queryParams = ["%quantum%"]
                    └── [Method] pool.query(queryText, queryParams)
                        ├── [Variable State Shift] Database Execution State: Query sent over pg pool socket to PostgreSQL engine
                        ├── [Variable State Shift] Mutated Output: result.rows = [{ id: 2, title: "Quantum Computing", category: "Hardware & Physics", ... }]
                        └── [Project] HTTP Response Payload: 200 OK JSON `[{"id":2,"title":"Quantum Computing",...}]`
```

---

### Trace C: Frontend Event Handling & Dynamic Render Loop

```
Execution Call Stack Trace:
└── [Project] Client Browser User Action (`input#search-input` keyup event: "quantum")
    ├── [Folder] client/src/js/
        └── [File] app.js
            └── [Class/Module] DOM Application Event Loop
                └── [Method] fetchItems()
                    ├── [Variable State Shift] Inbound Search State: searchInput.value = "quantum"
                    ├── [Variable State Shift] Target API URL: `/api/items?q=quantum`
                    └── [Method] fetch(url) -> await response.json()
                        ├── [Variable State Shift] Returned Data State: allItems = [{ id: 2, title: "Quantum Computing", ... }]
                        └── [Method] filterAndRenderItems()
                            ├── [Variable State Shift] Selected Category: categoryFilter.value = "ALL"
                            ├── [Variable State Shift] DOM Mutation: itemsContainer.innerHTML = `<article class="item-card"...>`
                            └── [Method] openModal(id) [On User Card Click]
                                ├── [Variable State Shift] Inbound ID: id = 2
                                ├── [Variable State Shift] DOM State: detailModal.classList.remove('hidden')
                                └── [Project] Rendered Visual Modal Display in Browser DOM
```
