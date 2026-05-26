# ArtBro Sketches — API Reference & Routes Documentation

---

## 1. API OVERVIEW
### Simple Explanation
An API (Application Programming Interface) is like a messenger that carries requests from the frontend of the website to the backend, and then brings back the answer. For example, when a user clicks "Add to Cart", the frontend sends an API request carrying the user's ID and the artwork's ID to the backend. The backend processes the request and replies with "Success! Item added." The frontend then displays a checkmark.

### Technical Explanation
The **ArtBro Sketches REST API** is built using Express.js. It follows RESTful conventions, using standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`), consistent status codes (e.g., `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `500 Server Error`), and stateless **JWT token authorization** via the `Authorization: Bearer <token>` header.

---

## 2. AUTHENTICATION MIDDLEWARE PROTECTIONS
Endpoints categorized under **Private / Authorized** or **Curator Admin Only** are protected by a JWT validation middleware (`backend/src/middlewares/authMiddleware.js`):
* The middleware extracts the token from the request header: `Authorization: Bearer <token>`.
* It verifies the signature against the server's `JWT_SECRET`.
* If valid, it decodes the payload (User ID and Role) and assigns it directly to the Express request object as `req.user`.
* For curator endpoints, a secondary role validator verifies that `req.user.role` matches `SUPER_ADMIN`, `MANAGER`, or `ARTIST`. If it does not, the request is instantly rejected with a `403 Forbidden` response.

---

## 3. COMPREHENSIVE ENDPOINT DOCUMENTATION

### 3.1 Authentication & Profile Routes (`/api/auth`)

#### [POST] /api/auth/register
* **Description:** Provisions a new user account. If the selected role is `ARTIST`, it automatically instantiates a blank, linked `Artist` profile.
* **Authentication Required:** None (Public)
* **Request Body:**
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "password": "securePassword123",
    "role": "USER" 
  }
  ```
* **Response Body (201 Created):**
  ```json
  {
    "id": "abc-123-uuid",
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "role": "USER",
    "token": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
  ```

#### [POST] /api/auth/login
* **Description:** Authenticates standard credentials and issues a 30-day secure JWT token.
* **Authentication Required:** None (Public)
* **Request Body:**
  ```json
  {
    "email": "alex@example.com",
    "password": "securePassword123"
  }
  ```
* **Response Body (200 OK):**
  ```json
  {
    "id": "abc-123-uuid",
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "profileImage": null,
    "role": "USER",
    "artistId": null,
    "token": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
  ```

#### [POST] /api/auth/google
* **Description:** Accepts a Google ID token from the client popup. Verifies it against Google's secure OAuth servers, registers a new account if the email doesn't exist, and returns a standard API JWT token.
* **Authentication Required:** None (Public)
* **Request Body:**
  ```json
  {
    "token": "google-oauth-credential-token-string",
    "role": "USER"
  }
  ```
* **Response Body (200 OK):**
  ```json
  {
    "id": "google-user-uuid",
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "profileImage": "https://lh3.googleusercontent.com/...",
    "role": "USER",
    "artistId": null,
    "authProvider": "google",
    "token": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
  ```

#### [GET] /api/auth/me
* **Description:** Validates the current JWT token and returns full account details. Used heavily during application refresh to prevent UI flickering.
* **Authentication Required:** Yes (Private)
* **Headers:** `Authorization: Bearer <token>`
* **Response Body (200 OK):**
  ```json
  {
    "id": "abc-123-uuid",
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "phone": null,
    "profileImage": null,
    "address": null,
    "role": "USER",
    "artistId": null,
    "createdAt": "2026-05-26T12:00:00Z"
  }
  ```

#### [PUT] /api/auth/profile
* **Description:** Updates the user's name, phone, and shipping address, and supports profile image uploads.
* **Authentication Required:** Yes (Private)
* **Request Body (Multipart Form-Data):**
  * `name` (String, Optional)
  * `phone` (String, Optional)
  * `address` (String, Optional)
  * `profileImage` (File, Optional)
* **Response Body (200 OK):**
  ```json
  {
    "id": "abc-123-uuid",
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "phone": "+1 555-0199",
    "address": "456 Gallery Boulevard",
    "profileImage": "/uploads/profiles/profileImage-12345.jpg",
    "role": "USER"
  }
  ```

---

### 3.2 Artwork & Inventory Routes (`/api/artworks`)

#### [GET] /api/artworks
* **Description:** Retrieves the list of all artworks. Supports search, category filtering, and featured flag querying.
* **Authentication Required:** None (Public)
* **Query Parameters:** `search`, `category`, `featured`
* **Response Body (200 OK):**
  ```json
  [
    {
      "id": "artwork-uuid-1",
      "title": "The Gaze",
      "category": "PORTRAIT",
      "price": 850,
      "status": "AVAILABLE",
      "image": "/uploads/artworks/sketch_1.jpeg",
      "artist": {
        "name": "Uday Chandra"
      }
    }
  ]
  ```

#### [GET] /api/artworks/:id
* **Description:** Retrieves full details for a specific artwork, including reviews.
* **Authentication Required:** None (Public)
* **Response Body (200 OK):**
  ```json
  {
    "id": "artwork-uuid-1",
    "title": "The Gaze",
    "description": "An exploration of silence...",
    "category": "PORTRAIT",
    "medium": "Graphite on Paper",
    "price": 850,
    "status": "AVAILABLE",
    "dimensions": "18\" x 24\"",
    "image": "/uploads/artworks/sketch_1.jpeg",
    "stock": 1,
    "isOriginal": true,
    "artist": {
      "id": "artist-uuid",
      "name": "Uday Chandra"
    },
    "reviews": []
  }
  ```

#### [POST] /api/artworks
* **Description:** Publishes a new artwork catalog entry.
* **Authentication Required:** Yes (Curator Admin Only)
* **Request Body (Multipart Form-Data):**
  * `title` (String), `description` (String), `category` (String), `medium` (String)
  * `price` (Float), `yearCreated` (Int), `dimensions` (String), `stock` (Int)
  * `featured` (Boolean)
  * `image` (File - Primary Upload)
* **Response Body (201 Created):**
  ```json
  {
    "id": "new-artwork-uuid",
    "title": "Divine Flute",
    "price": 1200,
    "status": "AVAILABLE",
    "image": "https://res.cloudinary.com/..."
  }
  ```

---

### 3.3 Custom Commission Routes (`/api/commissions`)

#### [POST] /api/commissions/request
* **Description:** Submits a new custom commission drawing request with budget, deadlines, and reference files.
* **Authentication Required:** Yes (Private)
* **Request Body (Multipart Form-Data):**
  * `clientName` (String), `email` (String), `phone` (String)
  * `artworkType` (String), `budget` (String), `deadline` (String - Date)
  * `message` (String), `shippingAddress` (String), `shippingCity` (String), `shippingPincode` (String)
  * `referenceImage` (File, Optional)
* **Response Body (21 Created):**
  ```json
  {
    "id": "commission-uuid",
    "clientName": "Sarah Jenkins",
    "artworkType": "Realistic Portrait",
    "status": "PENDING",
    "advanceAmount": 100,
    "paymentStatus": "PAID"
  }
  ```

#### [GET] /api/commissions/my-commissions
* **Description:** Fetches all commissions placed by the currently logged-in user.
* **Authentication Required:** Yes (Private)
* **Response Body (200 OK):**
  ```json
  [
    {
      "id": "commission-uuid",
      "artworkType": "Realistic Portrait",
      "status": "IN_PROGRESS",
      "createdAt": "2026-05-26T12:00:00Z"
    }
  ]
  ```

---

### 3.4 E-Commerce Cart & Order Routes (`/api/cart` & `/api/orders`)

#### [GET] /api/cart
* **Description:** Returns the active shopping cart items for the logged-in user.
* **Authentication Required:** Yes (Private)
* **Response Body (200 OK):**
  ```json
  [
    {
      "id": "cart-item-uuid",
      "quantity": 1,
      "artwork": {
        "id": "artwork-uuid-1",
        "title": "The Gaze",
        "price": 850,
        "image": "/uploads/artworks/sketch_1.jpeg"
      }
    }
  ]
  ```

#### [POST] /api/orders
* **Description:** Processes checkout. Creates the Order and OrderItems, flags the purchased artworks as `SOLD`, and empties the cart inside a secure database transaction.
* **Authentication Required:** Yes (Private)
* **Request Body:**
  ```json
  {
    "shippingName": "Alex Mercer",
    "shippingEmail": "alex@example.com",
    "shippingPhone": "+1 555-0199",
    "shippingAddress": "456 Gallery Boulevard",
    "shippingCity": "New York",
    "shippingPincode": "10001",
    "paymentMethod": "COD",
    "notes": "Please ship with extra protective cardboard layering."
  }
  ```
* **Response Body (201 Created):**
  ```json
  {
    "id": "order-uuid-abc",
    "status": "PENDING",
    "total": 850,
    "paymentStatus": "PENDING"
  }
  ```
