# Login Error Debugging Plan

## Issue
Login "An error occurred" on AWS server. Need to identify whether shows it's:
- Frontend not connecting to backend
- Backend authentication logic issue
- Database not seeded
- Configuration mismatch

## Steps to Debug

### Step 1: Check if backend is accessible
- Verify backend is running on AWS
- Test API endpoint directly using curl or Postman

### Step 2: Check database seeding
- Verify users exist in the database on AWS
- Ensure seed.py has been run

### Step 3: Fix API configuration for production
- Option A: Set up nginx reverse proxy to route /api to backend
- Option B: Configure frontend with actual backend URL (e.g., http://your-aws-ip:8000)
- Option C: Serve frontend and backend from same origin

### Step 4: Verify CORS configuration
- Ensure backend CORS allows your frontend domain

## Required Information from User

1. How is the frontend being served on AWS?
2. How is the backend being run2, systemd on AWS (PM, etc.)?
3. What URL are you accessing the frontend from?
4. What URL is the backend running on?

