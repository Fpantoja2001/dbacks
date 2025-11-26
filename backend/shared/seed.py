#!/usr/bin/env python3
"""
Seed script to create a master admin user.
Run this script to initialize the database with an admin account.

Usage (inside Docker):
    docker-compose exec user_service python shared/seed.py
    Or: docker-compose exec player_service python shared/seed.py
    
Usage (with environment variables):
    ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secure123 python shared/seed.py
    
Non-interactive mode (for CI/CD):
    FORCE_UPDATE=true python shared/seed.py
"""

import os
import sys

# Add backend directory to path if running from project root
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from sqlalchemy.orm import Session
from shared.db import engine, SessionLocal
from shared.orm_models import User, Token, Base

# Admin user credentials (can be overridden with environment variables)
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@dbacks.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
ADMIN_FIRST_NAME = os.getenv("ADMIN_FIRST_NAME", "Admin")
ADMIN_LAST_NAME = os.getenv("ADMIN_LAST_NAME", "User")

def create_admin_user(db: Session):
    """Create or update admin user"""
    print("=" * 60)
    print("SEEDING DATABASE - Creating Master Admin User")
    print("=" * 60)
    
    # Check if admin user already exists
    existing_user = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    
    if existing_user:
        print(f"⚠ Admin user already exists: {ADMIN_EMAIL}")
        print(f"  User ID: {existing_user.id}")
        print(f"  Name: {existing_user.first_name} {existing_user.last_name}")
        
        # Check if user has a token
        if existing_user.token:
            token = db.query(Token).filter(Token.id == existing_user.token).first()
            if token:
                print(f"  Token ID: {token.id}")
                print(f"  Token Claimer: {token.claimer}")
        
        # Check if we should force update (for non-interactive mode)
        force_update = os.getenv("FORCE_UPDATE", "false").lower() == "true"
        
        # Ask if user wants to update (unless force update is enabled)
        if force_update:
            response = 'y'
            print("\n  Force update enabled, updating admin user...")
        else:
            response = input("\n  Do you want to update the admin user? (y/N): ").strip().lower()
        
        if response == 'y':
            existing_user.first_name = ADMIN_FIRST_NAME
            existing_user.last_name = ADMIN_LAST_NAME
            existing_user.password = ADMIN_PASSWORD
            db.commit()
            db.refresh(existing_user)
            print("  ✓ Admin user updated")
        else:
            print("  Skipping user update")
            admin_user = existing_user
    else:
        # Create new admin user
        print(f"\nCreating admin user...")
        print(f"  Email: {ADMIN_EMAIL}")
        print(f"  Name: {ADMIN_FIRST_NAME} {ADMIN_LAST_NAME}")
        
        admin_user = User(
            first_name=ADMIN_FIRST_NAME,
            last_name=ADMIN_LAST_NAME,
            email=ADMIN_EMAIL,
            password=ADMIN_PASSWORD
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"  ✓ Admin user created (ID: {admin_user.id})")
    
    # Create or get token for admin user
    if not existing_user or not existing_user.token:
        print(f"\nCreating token for admin user...")
        admin_token = Token()
        db.add(admin_token)
        db.commit()
        db.refresh(admin_token)
        
        # Associate token with admin user
        admin_token.claimer = admin_user.id
        admin_user.token = admin_token.id
        db.commit()
        db.refresh(admin_token)
        db.refresh(admin_user)
        
        print(f"  ✓ Token created (ID: {admin_token.id})")
        print(f"  ✓ Token associated with admin user")
    else:
        print(f"\nAdmin user already has a token")
        token = db.query(Token).filter(Token.id == existing_user.token).first()
        if token:
            print(f"  Token ID: {token.id}")
    
    print("\n" + "=" * 60)
    print("SEED COMPLETE!")
    print("=" * 60)
    print(f"\nAdmin Credentials:")
    print(f"  Email: {ADMIN_EMAIL}")
    print(f"  Password: {ADMIN_PASSWORD}")
    print(f"  User ID: {admin_user.id}")
    if admin_user.token:
        print(f"  Token ID: {admin_user.token}")
    print("\nYou can now log in with these credentials.")
    print("=" * 60)
    
    return admin_user

def main():
    """Main seed function"""
    try:
        # Create tables if they don't exist
        print("Creating database tables if they don't exist...")
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables ready")
        
        # Create database session
        db = SessionLocal()
        try:
            # Create admin user
            admin_user = create_admin_user(db)
            
        except Exception as e:
            db.rollback()
            print(f"\n✗ Error seeding database: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
        finally:
            db.close()
            
    except Exception as e:
        print(f"\n✗ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

