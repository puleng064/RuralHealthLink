from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import datetime, timedelta
import os

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'rural-health-tracker-secret-key-2025'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Database Models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    date_of_birth = db.Column(db.String(10), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    appointments = db.relationship('Appointment', backref='user', lazy=True, cascade='all, delete-orphan')
    symptoms = db.relationship('Symptom', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'gender': self.gender,
            'dateOfBirth': self.date_of_birth,
            'isAdmin': self.is_admin,
            'createdAt': self.created_at.isoformat()
        }

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.String(10), nullable=False)
    time = db.Column(db.String(5), nullable=False)
    provider = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='scheduled', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'date': self.date,
            'time': self.time,
            'provider': self.provider,
            'type': self.type,
            'reason': self.reason,
            'status': self.status,
            'createdAt': self.created_at.isoformat()
        }

class Symptom(db.Model):
    __tablename__ = 'symptoms'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date_time = db.Column(db.String(19), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.Integer, nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'dateTime': self.date_time,
            'category': self.category,
            'description': self.description,
            'severity': self.severity,
            'notes': self.notes,
            'createdAt': self.created_at.isoformat()
        }

class Contact(db.Model):
    __tablename__ = 'contacts'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'subject': self.subject,
            'message': self.message,
            'createdAt': self.created_at.isoformat()
        }

# Routes
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('static', path)

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already exists'}), 400
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data['firstName'],
            last_name=data['lastName'],
            gender=data['gender'],
            date_of_birth=data['dateOfBirth']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'user': user.to_dict(),
            'access_token': access_token
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Registration failed'}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        
        if user and user.check_password(data['password']):
            access_token = create_access_token(identity=user.id)
            return jsonify({
                'user': user.to_dict(),
                'access_token': access_token
            })
        
        return jsonify({'message': 'Invalid credentials'}), 401
        
    except Exception as e:
        return jsonify({'message': 'Login failed'}), 400

# User Routes
@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or not current_user.is_admin:
            return jsonify({'message': 'Admin access required'}), 403
        
        users = User.query.all()
        return jsonify([user.to_dict() for user in users])
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch users'}), 500

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or not current_user.is_admin:
            return jsonify({'message': 'Admin access required'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        if user.is_admin:
            return jsonify({'message': 'Cannot delete admin user'}), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'})
        
    except Exception as e:
        return jsonify({'message': 'Failed to delete user'}), 500

# Appointment Routes
@app.route('/api/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    try:
        current_user_id = get_jwt_identity()
        user_id = request.args.get('userId')
        
        if user_id:
            appointments = Appointment.query.filter_by(user_id=user_id).all()
        else:
            appointments = Appointment.query.filter_by(user_id=current_user_id).all()
        
        return jsonify([appointment.to_dict() for appointment in appointments])
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch appointments'}), 500

@app.route('/api/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        appointment = Appointment(
            user_id=current_user_id,
            date=data['date'],
            time=data['time'],
            provider=data['provider'],
            type=data['type'],
            reason=data['reason']
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify(appointment.to_dict()), 201
        
    except Exception as e:
        return jsonify({'message': 'Failed to create appointment'}), 400

@app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(appointment_id):
    try:
        current_user_id = get_jwt_identity()
        appointment = Appointment.query.get(appointment_id)
        
        if not appointment:
            return jsonify({'message': 'Appointment not found'}), 404
        
        if appointment.user_id != current_user_id:
            return jsonify({'message': 'Access denied'}), 403
        
        db.session.delete(appointment)
        db.session.commit()
        
        return jsonify({'message': 'Appointment deleted successfully'})
        
    except Exception as e:
        return jsonify({'message': 'Failed to delete appointment'}), 500

# Symptom Routes
@app.route('/api/symptoms', methods=['GET'])
@jwt_required()
def get_symptoms():
    try:
        current_user_id = get_jwt_identity()
        user_id = request.args.get('userId')
        
        if user_id:
            symptoms = Symptom.query.filter_by(user_id=user_id).all()
        else:
            symptoms = Symptom.query.filter_by(user_id=current_user_id).all()
        
        return jsonify([symptom.to_dict() for symptom in symptoms])
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch symptoms'}), 500

@app.route('/api/symptoms', methods=['POST'])
@jwt_required()
def create_symptom():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        symptom = Symptom(
            user_id=current_user_id,
            date_time=data['dateTime'],
            category=data['category'],
            description=data['description'],
            severity=data['severity'],
            notes=data.get('notes')
        )
        
        db.session.add(symptom)
        db.session.commit()
        
        return jsonify(symptom.to_dict()), 201
        
    except Exception as e:
        return jsonify({'message': 'Failed to create symptom'}), 400

@app.route('/api/symptoms/<int:symptom_id>', methods=['DELETE'])
@jwt_required()
def delete_symptom(symptom_id):
    try:
        current_user_id = get_jwt_identity()
        symptom = Symptom.query.get(symptom_id)
        
        if not symptom:
            return jsonify({'message': 'Symptom not found'}), 404
        
        if symptom.user_id != current_user_id:
            return jsonify({'message': 'Access denied'}), 403
        
        db.session.delete(symptom)
        db.session.commit()
        
        return jsonify({'message': 'Symptom deleted successfully'})
        
    except Exception as e:
        return jsonify({'message': 'Failed to delete symptom'}), 500

# Contact Routes
@app.route('/api/contacts', methods=['GET'])
@jwt_required()
def get_contacts():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or not current_user.is_admin:
            return jsonify({'message': 'Admin access required'}), 403
        
        contacts = Contact.query.all()
        return jsonify([contact.to_dict() for contact in contacts])
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch contacts'}), 500

@app.route('/api/contacts', methods=['POST'])
def create_contact():
    try:
        data = request.get_json()
        
        contact = Contact(
            name=data['name'],
            email=data['email'],
            subject=data['subject'],
            message=data['message']
        )
        
        db.session.add(contact)
        db.session.commit()
        
        return jsonify(contact.to_dict()), 201
        
    except Exception as e:
        return jsonify({'message': 'Failed to send message'}), 400

@app.route('/api/contacts/<int:contact_id>', methods=['DELETE'])
@jwt_required()
def delete_contact(contact_id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or not current_user.is_admin:
            return jsonify({'message': 'Admin access required'}), 403
        
        contact = Contact.query.get(contact_id)
        if not contact:
            return jsonify({'message': 'Contact not found'}), 404
        
        db.session.delete(contact)
        db.session.commit()
        
        return jsonify({'message': 'Contact deleted successfully'})
        
    except Exception as e:
        return jsonify({'message': 'Failed to delete contact'}), 500

# Initialize database and create default admin user
def init_db():
    with app.app_context():
        db.create_all()
        
        # Create default admin user if not exists
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@ruralhealthtracker.com',
                first_name='Admin',
                last_name='User',
                gender='Other',
                date_of_birth='1990-01-01',
                is_admin=True
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print("Default admin user created: admin/admin123")

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)