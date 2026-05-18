# ArtBro Sketches - Database Entity-Relationship Diagram

This document outlines the database schema architecture for the ArtBro Sketches ecommerce platform, built using Prisma ORM and MySQL.

## Mermaid ER Diagram

```mermaid
erDiagram
    USER {
        String id PK
        String email UK
        String password
        String name
        Role role "USER, MANAGER, ADMIN"
        DateTime createdAt
        DateTime updatedAt
    }

    ARTWORK {
        String id PK
        String title
        String description
        String category "PORTRAIT, PEN_ART, KRISHNA_ART, PAINTING, EXPERIMENTAL"
        String medium
        String image
        String dimensions
        Int yearCreated
        Boolean featured
        String status "AVAILABLE, SOLD, RESERVED"
        Float price
        Boolean isOriginal
        Int stock
        String artworkStory
        DateTime createdAt
        DateTime updatedAt
        String artistId FK
    }

    ARTIST {
        String id PK
        String name
        String bio
        String profileImage
        DateTime createdAt
        DateTime updatedAt
    }

    EXHIBITION {
        String id PK
        String title
        String description
        DateTime startDate
        DateTime endDate
        String location
        String coverImage
        String status "UPCOMING, ONGOING, PAST"
        DateTime createdAt
        DateTime updatedAt
    }

    COMMISSION {
        String id PK
        String clientName
        String email
        String artworkType
        String size
        String budget
        String message
        String status "PENDING, REVIEWING, APPROVED, REJECTED, COMPLETED"
        DateTime createdAt
        DateTime updatedAt
    }

    CART_ITEM {
        String id PK
        Int quantity
        DateTime createdAt
        DateTime updatedAt
        String userId FK
        String artworkId FK
    }

    WISHLIST_ITEM {
        String id PK
        DateTime createdAt
        String userId FK
        String artworkId FK
    }

    ORDER {
        String id PK
        Float totalAmount
        String status "PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED"
        String shippingAddress
        String paymentId
        DateTime createdAt
        DateTime updatedAt
        String userId FK
    }

    ORDER_ITEM {
        String id PK
        Int quantity
        Float price
        String orderId FK
        String artworkId FK
    }

    REVIEW {
        String id PK
        Int rating
        String comment
        DateTime createdAt
        DateTime updatedAt
        String userId FK
        String artworkId FK
    }

    %% Relationships
    USER ||--o{ CART_ITEM : "has"
    USER ||--o{ WISHLIST_ITEM : "saves"
    USER ||--o{ ORDER : "places"
    USER ||--o{ REVIEW : "writes"

    ARTIST ||--o{ ARTWORK : "creates"
    
    ARTWORK ||--o{ CART_ITEM : "in"
    ARTWORK ||--o{ WISHLIST_ITEM : "in"
    ARTWORK ||--o{ ORDER_ITEM : "in"
    ARTWORK ||--o{ REVIEW : "receives"

    ORDER ||--o{ ORDER_ITEM : "contains"
```

## Description of Key Entities

1. **USER**: Stores authentication credentials, profile information, and role-based access control flags (`USER`, `ADMIN`).
2. **ARTWORK**: The core product model. Includes standard gallery fields (medium, dimensions) plus ecommerce fields (`price`, `stock`, `isOriginal`, `status`).
3. **CART_ITEM / WISHLIST_ITEM**: Join tables connecting Users and Artworks, storing user preferences and intent to purchase.
4. **ORDER / ORDER_ITEM**: Immutable records of a completed transaction. `ORDER` stores overall shipping and payment details, while `ORDER_ITEM` locks in the `price` at the time of purchase to protect against future price changes on the artwork.
5. **REVIEW**: Allows users to leave feedback and ratings on purchased artworks.
