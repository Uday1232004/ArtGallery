import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

from models import db

# Define db_url from env above
db_url = os.environ.get("DATABASE_URL", "mysql+mysqlconnector://root:@localhost:3306/art_gallery_db")
if db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+mysqlconnector://")

app.config["SQLALCHEMY_DATABASE_URI"] = db_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get("JWT_SECRET", "supersecret_jwt_key_art_gallery")

db.init_app(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Flask backend is running"}), 200

from routes.auth import auth_bp
app.register_blueprint(auth_bp, url_prefix='/api/auth')

if __name__ == '__main__':
    app.run(port=5000, debug=True)
