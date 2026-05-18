# Relational Schema & Normalization

## Tables & Primary/Foreign Keys

### 1. `User` (Admin)
- **id** (VARCHAR, Primary Key)
- **email** (VARCHAR, Unique)
- **passwordHash** (VARCHAR)
- **name** (VARCHAR)
- **role** (ENUM: 'SUPER_ADMIN', 'MANAGER')

### 2. `Artist`
- **id** (VARCHAR, Primary Key)
- **name** (VARCHAR)
- **bio** (TEXT)
- **specialization** (VARCHAR)
- **profileImage** (VARCHAR)
- **socialLinks** (JSON)

### 3. `Artwork`
- **id** (VARCHAR, Primary Key)
- **title** (VARCHAR)
- **description** (TEXT)
- **category** (ENUM: 'PORTRAIT', 'PEN_ART', 'PAINTING', etc.)
- **medium** (VARCHAR)
- **price** (DECIMAL)
- **status** (ENUM: 'AVAILABLE', 'SOLD', 'UNAVAILABLE')
- **image** (VARCHAR)
- **featured** (BOOLEAN)
- **artistId** (VARCHAR, Foreign Key -> Artist.id)

### 4. `Exhibition`
- **id** (VARCHAR, Primary Key)
- **name** (VARCHAR)
- **theme** (VARCHAR)
- **description** (TEXT)
- **startDate** (DATETIME)
- **endDate** (DATETIME)
- **bannerImage** (VARCHAR)

### 5. `ExhibitionArtwork` (Join Table)
- **exhibitionId** (VARCHAR, Foreign Key -> Exhibition.id)
- **artworkId** (VARCHAR, Foreign Key -> Artwork.id)
- **Primary Key:** (exhibitionId, artworkId)

### 6. `Commission`
- **id** (VARCHAR, Primary Key)
- **clientName** (VARCHAR)
- **email** (VARCHAR)
- **artworkType** (VARCHAR)
- **budget** (VARCHAR)
- **deadline** (DATETIME)
- **message** (TEXT)
- **referenceImage** (VARCHAR)
- **status** (ENUM: 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED')

### 7. `Sale`
- **id** (VARCHAR, Primary Key)
- **artworkId** (VARCHAR, Foreign Key -> Artwork.id)
- **customerName** (VARCHAR)
- **customerEmail** (VARCHAR)
- **salePrice** (DECIMAL)
- **saleDate** (DATETIME)

---

## Normalization Process

This database follows the **Third Normal Form (3NF)**:

1. **First Normal Form (1NF):** All tables have a primary key (`id`). Each column contains atomic values. We use JSON data types for multi-valued attributes like `socialLinks` to maintain structural integrity in MySQL 8+.
2. **Second Normal Form (2NF):** No partial dependencies. All non-key attributes depend on the entire primary key. In the `ExhibitionArtwork` join table, attributes related to the exhibition or artwork are stored in their respective main tables, not the join table.
3. **Third Normal Form (3NF):** No transitive dependencies. For example, in the `Sale` table, the artist's name is not duplicated; it is retrieved via the relationship: `Sale -> Artwork -> Artist`. This prevents update anomalies.

## Relationships

*   **Artist to Artwork (1:N)** - An artist can have many artworks, but an artwork belongs to one artist.
*   **Artwork to Exhibition (M:N)** - An artwork can be featured in multiple exhibitions, and an exhibition features multiple artworks. Resolved via the `ExhibitionArtwork` join table.
*   **Artwork to Sale (1:N)** - While typically an original artwork is sold once (1:1), prints or digital rights could allow multiple sales. We designed it as 1:N to allow for future expansion (e.g. limited edition prints).
