#!/usr/bin/env python3
from app import app, db, init_db
import os

if __name__ == '__main__':
    # Initialize database and create tables
    with app.app_context():
        init_db()
    
    # Run the Flask application
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)