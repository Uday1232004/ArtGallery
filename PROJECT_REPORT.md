# ArtBro Sketches — Comprehensive Academic Project Report

---

## Cover Page Information
* **Project Title:** ArtBro Sketches — Premium Digital Art Gallery & Custom Commission Engine
* **Purpose:** Academic Capstone Project / DBMS Course Project
* **Author:** Uday Chandra
* **Institutions / Role:** Lead Developer & System Architect
* **Date:** May 2026

---

## 1. ABSTRACT
### Simple Explanation (For non-technical reviewers)
Imagine an artist who creates beautiful drawings but has no clean way to showcase them, set prices, take custom request orders (commissions), or sell their work directly to art lovers. On the other side, think of an art lover who wants to buy original hand-drawn sketches or order a custom drawing (like a portrait of their grandfather) but doesn't know how to contact the artist, pay safely, or track the progress. 

**ArtBro Sketches** is a website that bridges this gap. It acts as an online digital art gallery where an artist can list their sketches, display verified profiles, organize virtual exhibitions, and manage custom orders. Art lovers can browse, add drawings to a shopping cart or wishlist, buy original sketches, and place custom commission requests with full order-tracking capabilities.

### Technical Explanation (For engineers, professors, and interviewers)
**ArtBro Sketches** is a production-ready, full-stack web application designed to digitize art commerce and streamline the custom art commission lifecycle. It utilizes a **decoupled Client-Server Architecture** built on a high-performance modern stack:
* **Frontend:** A responsive Single Page Application (SPA) developed with **React.js** and **Vite**, styled using **Tailwind CSS**, and animated smoothly with **GSAP (GreenSock Animation Platform)** and **Framer Motion** for a premium, cinematic user experience.
* **Backend:** A RESTful API built on **Node.js** and **Express.js**, implementing a structured controller-route architecture.
* **Data Access & Storage:** Powered by a containerized **MySQL** database, managed and accessed through the typesafe **Prisma ORM** layer, with support for auto-rollback transactional operations.
* **Media Storage:** Integrated with the **Cloudinary API** for resilient, high-speed cloud-based image hosting, with an automated local disk storage fallback.
* **Security & SSO:** Secured using dual-layered authentication consisting of stateless **JSON Web Tokens (JWT)** for standard login, combined with **Google OAuth 2.0** for modern Single Sign-On (SSO).
* **Infrastructure:** Fully containerized using **Docker** and orchestrated via **Docker Compose** to guarantee environment consistency across development, testing, and deployment.

---

## 2. PROJECT OVERVIEW
### What Problem the Project Solves
1. **Inefficient Custom Commission Management:** Traditionally, custom art requests are handled via chaotic email threads, direct messages on social media, or verbal agreements. This leads to mismanaged budgets, missed deadlines, and payment disputes. **ArtBro Sketches** implements a state-driven, standardized commission workflow where clients submit details, pay an advance, and track progress transparently.
2. **Lack of Immersive Presentation for Monochromatic Art:** Pencil and charcoal sketches have subtle micro-textures that generic e-commerce platforms flatten. The visual system of this app utilizes a high-contrast dark theme ("void" and "ivory" colors) with cinematic image rendering, giving physical drawings the digital prestige they deserve.
3. **Disjointed Gallery and Storefronts:** Artists often use one platform to showcase portfolio pieces (e.g., Behance/Instagram) and another to sell (e.g., Etsy). This app unites a public high-fidelity portfolio, storytelling timelines, live e-commerce, and a custom commission dashboard into a single hub.

### Target Users
* **The Lead Artist / Curator:** Manages the inventory, uploads new sketches, runs exhibitions, updates the professional profile, reviews custom commission requests, and tracks order fulfillment.
* **The Collectors / Art Lovers:** Browse high-resolution artworks, add original drawings to a cart or wishlist, purchase pieces, request custom sketches, and leave verified reviews.
* **System Managers:** Oversee system performance, analyze sales dashboards, and handle customer service logistics.

### Core Objectives
* Provide an elegant, premium, and highly responsive user interface with rich micro-animations.
* Secure critical client-curator data using modern authentication standards.
* Implement a robust, highly normalized relational database to maintain data integrity across carts, wishlists, orders, and custom commissions.
* Facilitate hassle-free deployment and multi-developer collaboration through containerization.

### Real-World Relevance
This project addresses real e-commerce challenges:
* Handling multi-part form data (uploading physical image files alongside text data).
* Managing transactional inventory states (handling stock counts, ensuring "SOLD" items cannot be purchased twice).
* Designing database triggers and cascading deletions (cleaning up cart and wishlist items automatically once an artwork is deleted or purchased).

---

## 3. FULL TECH STACK & ROLES
### React.js (Frontend UI Engine)
* **Simple:** React builds the visible parts of the website, like the gallery grids, shopping carts, and sliders. It makes the site run fast without refreshing the page.
* **Technical:** React.js acts as the component-based UI engine. It handles declarative state management, virtual DOM rendering, and single-page routing via **React Router v7**. Context API is utilized for global authentication and mouse cursor state management.

### Vite (Build & Tooling)
* **Simple:** Vite is the tool that packages the code, making the website load instantly during development.
* **Technical:** Vite serves as the modern front-end build tool replacing Webpack. It utilizes Esbuild to provide lightning-fast Hot Module Replacement (HMR) and highly optimized roll-up compilation for production assets.

### Tailwind CSS (Styling Utility)
* **Simple:** Tailwind is used to design the layout, colors, buttons, and responsive grid layouts (mobile vs. desktop).
* **Technical:** Tailwind CSS is a utility-first CSS framework. It enforces a strict design system (colors like `void`, `carbon`, `mist`, `gold`, `ivory`) and achieves fully responsive layouts without writing bloated stylesheets.

### Node.js & Express.js (API Runtime & Web Server)
* **Simple:** Node.js is the brain in the background that listens to requests (like "login this user" or "buy this artwork") and coordinates with the database.
* **Technical:** Node.js provides the asynchronous, event-driven JavaScript runtime. Express.js sits on top, managing the RESTful routing pipeline, parsing request body streams, and executing custom middleware chains (e.g., token validation, image uploads).

### Prisma ORM (Database Interface)
* **Simple:** Prisma is the middleman that translates JavaScript code into database language (SQL) so we don't have to write raw database queries.
* **Technical:** Prisma ORM acts as the Object-Relational Mapper. It provides a declarative, type-safe schema (`schema.prisma`), manages database migrations, generates automated types for TypeScript/JavaScript, and ensures relational data fetching is clean and protected against SQL injection.

### MySQL (Relational Database)
* **Simple:** The permanent filing cabinet where all users, sketches, orders, reviews, and commissions are stored safely.
* **Technical:** MySQL is the relational database engine. It guarantees ACID properties (Atomicity, Consistency, Isolation, Durability) for transaction safety (critical during checkout) and handles relational joins between different tables efficiently.

### Docker (Infrastructure Containerization)
* **Simple:** Docker wraps the MySQL database in an isolated virtual box, meaning it will run exactly the same way on any machine (your computer, your friend's computer, or a cloud server).
* **Technical:** Docker containerizes the MySQL database. Using a `docker-compose.yml` file, it isolates database dependencies, eliminates the "it works on my machine" problem, and provides instant setup for developers via standardized network mapping.

### JWT Authentication (Stateless Security)
* **Simple:** Like a digital entry pass (wristband) given to you when you log in. For the next 30 days, your browser shows this pass to the backend automatically to prove you are logged in.
* **Technical:** JSON Web Tokens (JWT) act as the stateless, cryptographically signed authentication mechanism. The backend generates a token containing the user’s ID and Role, signs it with a server-side `JWT_SECRET`, and the frontend stores it in `localStorage` to authorize subsequent requests via the `Authorization: Bearer <token>` header.

### Google OAuth 2.0 (Single Sign-On)
* **Simple:** Let's users log in instantly using their existing Google account, without typing a new password.
* **Technical:** Google OAuth implements secure federated identity management. The frontend utilizes the `@react-oauth/google` SDK to display the Google One Tap/OAuth popup, retrieves a secure JWT ID token, and sends it to the Express backend. The backend decrypts and verifies the token using the Google Auth Library to register or log in the user safely.

---

## 4. FEATURE BREAKDOWN
### Modern Artwork Upload Pipeline
* **Simple:** An admin uploads a sketch, enters a description, price, and category. The image is saved in the cloud, and the database records all details.
* **Technical:** The admin uploads a multipart form containing details and files. The Express backend handles the upload using **Multer** and redirects the stream to **Cloudinary** (or local disk if Cloudinary is offline). A new `Artwork` record is written to the database with the resulting image URL.

### Structured Commission Workflow
* **Simple:** A client fills out a request form with their budget, deadline, reference photos, and address. Once they pay an advance, the artist starts sketching, showing progress updates along a visual timeline.
* **Technical:** A `Commission` record is created in the database with status `PENDING`. Upon payment, status shifts to `APPROVED` and then `IN_PROGRESS`. When finished, the artist creates a corresponding `Artwork` record (marking it as the commissioned outcome), links it to the commission record, and uploads the final drawing. The status moves to `COMPLETED`.

### Interactive User Profile & Cart System
* **Simple:** Customers can customize their profile, add sketches to a cart, or save them in a wishlist.
* **Technical:** A `CartItem` or `WishlistItem` table records unique combinations of `userId` and `artworkId`. When checkout is triggered, a transaction creates an `Order` and corresponding `OrderItem` records, updates the artwork's status to `SOLD`, and empties the user's cart.

### Immersive Virtual Exhibitions
* **Simple:** The artist can group drawings together under a specific theme (like "Shadows & Light") and give it a date range, creating a digital museum event.
* **Technical:** The `Exhibition` model stores events with start and end dates. The join table `ExhibitionArtwork` associates multiple artworks with an exhibition. The frontend queries active exhibitions, rendering an interactive banner and associated artworks in a curated sub-gallery.

---

## 5. TECHNICAL CHALLENGES & SOLUTIONS
### Challenge 1: The Multi-Step File Upload with Third-Party Fallback
* **Problem:** If the Cloudinary cloud service goes down or is unconfigured, image uploads crash, preventing the admin from listing artworks.
* **Solution:** Developed an asset helper service in Node.js. The upload middleware intercepts files and checks for environment variables. If Cloudinary keys are present, it uses `multer-storage-cloudinary`. If missing, it dynamically swaps storage destination to a local `backend/uploads/` directory. The frontend handles both paths smoothly by using a URL normalizer utility.

### Challenge 2: Race Conditions & Double Purchases in E-Commerce Checkout
* **Problem:** If two users have the same original, one-of-a-kind artwork in their carts and click "Checkout" at the exact same millisecond, both might pay, leading to a database error or selling a single physical item twice.
* **Solution:** Wrapped the checkout process in a database transaction block using Prisma's transactional API (`prisma.$transaction`). Before creating the order, the system queries the current status of all requested items with a row-level lock. If any item is already marked as `SOLD` or has a stock count of `0`, the transaction instantly rolls back, raising a client-friendly error.

---

## 6. FUTURE ENHANCEMENTS
1. **Integrated Stripe Payment Gateway:** Replace standard cash-on-delivery/advance mockups with direct credit card and UPI processing via Stripe checkout hooks.
2. **Virtual 3D Gallery (Three.js):** Build a 3D virtual environment where collectors can walk through exhibitions and see sketches hanging on virtual walls.
3. **AI Sketch Analyzer / Style Matcher:** Implement a lightweight machine-learning pipeline to suggest similar sketches to collectors based on their browsing history and purchase patterns.
