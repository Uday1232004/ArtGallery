from flask import Blueprint, request, jsonify
import jwt
import os
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

from models import db, User

auth_bp = Blueprint('auth', __name__)

JWT_SECRET = os.environ.get('JWT_SECRET', 'supersecret_jwt_key_art_gallery')

def generate_token(user_id):
    payload = {
        'id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password or not name:
        return jsonify({'message': 'All fields are required'}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'message': 'User already exists'}), 400

    hashed_password = generate_password_hash(password)
    user_id = str(uuid.uuid4())
    
    new_user = User(
        id=user_id,
        email=email,
        passwordHash=hashed_password,
        name=name
    )

    db.session.add(new_user)
    db.session.commit()

    token = generate_token(user_id)
    
    return jsonify({
        'token': token,
        'user': {
            'id': new_user.id,
            'name': new_user.name,
            'email': new_user.email,
            'role': new_user.role,
            'avatar': new_user.avatar
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    
    if not user or not check_password_hash(user.passwordHash, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = generate_token(user.id)

    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'avatar': user.avatar
        }
    }), 200
