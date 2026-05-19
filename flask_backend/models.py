from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'User'
    id = db.Column(db.String(191), primary_key=True)
    email = db.Column(db.String(191), unique=True, nullable=False)
    passwordHash = db.Column(db.String(191), nullable=False)
    name = db.Column(db.String(191), nullable=False)
    phone = db.Column(db.String(191))
    avatar = db.Column(db.String(191))
    address = db.Column(db.Text)
    role = db.Column(db.String(191), default="USER")
    authProvider = db.Column(db.String(191), default="local")
    createdAt = db.Column(db.DateTime, server_default=db.func.now())
    updatedAt = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    artistId = db.Column(db.String(191), db.ForeignKey('Artist.id'), unique=True)

class Artist(db.Model):
    __tablename__ = 'Artist'
    id = db.Column(db.String(191), primary_key=True)
    name = db.Column(db.String(191), nullable=False)
    bio = db.Column(db.Text, nullable=False)
    specialization = db.Column(db.String(191), nullable=False)
    experience = db.Column(db.String(191))
    profileImage = db.Column(db.String(191))
    socialLinks = db.Column(db.JSON)
    createdAt = db.Column(db.DateTime, server_default=db.func.now())
    updatedAt = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

class Artwork(db.Model):
    __tablename__ = 'Artwork'
    id = db.Column(db.String(191), primary_key=True)
    title = db.Column(db.String(191), nullable=False)
    description = db.Column(db.Text, nullable=False)
    artworkStory = db.Column(db.Text)
    category = db.Column(db.String(191), nullable=False)
    medium = db.Column(db.String(191), nullable=False)
    price = db.Column(db.Float)
    status = db.Column(db.String(191), default="AVAILABLE")
    yearCreated = db.Column(db.Integer, nullable=False)
    dimensions = db.Column(db.String(191))
    image = db.Column(db.String(191), nullable=False)
    images = db.Column(db.JSON)
    featured = db.Column(db.Boolean, default=False)
    tags = db.Column(db.JSON)
    stock = db.Column(db.Integer, default=1)
    isOriginal = db.Column(db.Boolean, default=True)
    artistId = db.Column(db.String(191), db.ForeignKey('Artist.id'), nullable=False)
    createdAt = db.Column(db.DateTime, server_default=db.func.now())
    updatedAt = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
