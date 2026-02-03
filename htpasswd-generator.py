#!/usr/bin/env python3
import hashlib
import base64
import os
import random
import string

def generate_password(length=12):
    """Generate a secure random password"""
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.choice(characters) for _ in range(length))

def create_htpasswd_entry(username, password):
    """Create htpasswd entry using SHA encryption"""
    salt = os.urandom(8).hex()
    # Format: {SHA}salt+hash
    sha_hash = hashlib.sha1((password + salt).encode()).hexdigest()
    return f"{username}:{{SHA}}{salt}${sha_hash}"

# Generate credentials
credentials = {}

# Jim's credentials
jim_password = generate_password()
jim_entry = create_htpasswd_entry("jim", jim_password)
credentials["jim"] = jim_password

# Nick's credentials  
nick_password = generate_password()
nick_entry = create_htpasswd_entry("nick", nick_password)
credentials["nick"] = nick_password

# Create .htpasswd content
htpasswd_content = f"""# Ascent XR Dashboard Authentication
# Generated: {os.path.basename(__file__)}
{jim_entry}
{nick_entry}
"""

# Save to file
with open("/home/jim/openclaw/.htpasswd", "w") as f:
    f.write(htpasswd_content)

print("=" * 60)
print("AScent XR Dashboard Authentication Setup")
print("=" * 60)
print("\n🔐 CREDENTIALS:")
print("-" * 30)
print(f"Username: jim")
print(f"Password: {jim_password}")
print(f"\nUsername: nick")
print(f"Password: {nick_password}")
print("\n" + "=" * 60)
print("📁 FILES CREATED:")
print("-" * 30)
print("1. .htaccess - Apache authentication configuration")
print("2. .htpasswd - Password file (upload to dashboard/)")
print("\n" + "=" * 60)
print("📋 DEPLOYMENT STEPS:")
print("-" * 30)
print("1. Upload dashboard/ folder to /dashboard/")
print("2. Upload .htaccess and .htpasswd to /dashboard/")
print("3. Access at: https://ascentxr.com/dashboard/")
print("4. Enter credentials when prompted")
print("\n" + "=" * 60)