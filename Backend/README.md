# 🚀 API Documentation for Frontend Developers

Welcome! This guide helps you understand all available API endpoints, what data to send, and what to expect back.

## 📋 Quick Reference

| Controller | Purpose | Auth Required |
|-----------|---------|--------------|
| **Auth** | User signup & login | ❌ |
| **User** | Profile management | ✅ |
| **Dustbin** | Dustbin CRUD operations | ❌ |
| **AI** | AQI data & AI chat | ❌ |

---

## 🔐 Authentication

**How to use protected routes:**
```javascript
// Add this header to your requests
headers: {
  'Authorization': 'Bearer <your_jwt_token>'
}
```

**Get token:** Login via `/api/auth/login` → token returned in response

---

## 🎯 API Endpoints

### 🔑 AUTH CONTROLLER (`/api/auth`)

#### **POST /api/auth/signup** - Create New User
**What to send:**
```javascript
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123"
}
```

**What you get back (200):**
```javascript
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "64f8a9b2c3d4e5f6g7h8i9j0",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2023-09-06T12:34:56.789Z"
    }
  }
}
```

**Errors (400/500):**
```javascript
{ "status": "fail", "message": "All fields are required" }
{ "status": "fail", "message": "Email already registered" }
```

---

#### **POST /api/auth/login** - User Login
**What to send:**
```javascript
{
  "email": "john@example.com",
  "password": "password123"
}
```

**What you get back (200):**
```javascript
{
  "status": "success", 
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "64f8a9b2c3d4e5f6g7h8i9j0",
      "name": "John Doe", 
      "email": "john@example.com"
    }
  }
}
```

**Errors (401/400):**
```javascript
{ "status": "fail", "message": "Invalid email or password" }
{ "status": "fail", "message": "Please provide email and password" }
```

---

### 👤 USER CONTROLLER (`/api/users`) - **🔒 PROTECTED**

#### **GET /api/users/profile** - Get Your Profile
**What to send:** Nothing (just add auth header)

**What you get back (200):**
```javascript
{
  "status": "success",
  "data": {
    "user": {
      "_id": "64f8a9b2c3d4e5f6g7h8i9j0",
      "name": "John Doe",
      "email": "john@example.com", 
      "createdAt": "2023-09-06T12:34:56.789Z",
      "updatedAt": "2023-09-06T12:34:56.789Z"
    }
  }
}
```

---

#### **PATCH /api/users/profile** - Update Your Profile
**What to send:**
```javascript
{
  "name": "John Smith",     // optional
  "email": "johnsmith@example.com"  // optional
}
```

**What you get back (200):**
```javascript
{
  "status": "success",
  "data": {
    "user": {
      "_id": "64f8a9b2c3d4e5f6g7h8i9j0",
      "name": "John Smith",
      "email": "johnsmith@example.com",
      "createdAt": "2023-09-06T12:34:56.789Z",
      "updatedAt": "2023-09-06T13:45:67.890Z"
    }
  }
}
```

**Errors (400):**
```javascript
{ "status": "fail", "message": "Please provide name or email to update" }
{ "status": "fail", "message": "Email already in use" }
```

---

#### **DELETE /api/users/profile** - Delete Your Account
**What to send:** Nothing (just add auth header)

**What you get back (200):**
```javascript
{
  "status": "success",
  "message": "Account deleted successfully"
}
```

---

### 🗑️ DUSTBIN CONTROLLER (`/api/dustbins`)

#### **GET /api/dustbins** - Get All Dustbins
**What to send:** Nothing

**What you get back (200):**
```javascript
[
  {
    "_id": "64f8a9b2c3d4e5f6g7h8i9j1",
    "name": "Main Street Dustbin",
    "lat": 40.7128,
    "lng": -74.0060,
    "reportedBy": "Jane Doe",
    "imageUrl": "/uploads/dustbin_1694012345678.jpg",
    "createdAt": "2023-09-06T12:34:56.789Z",
    "updatedAt": "2023-09-06T12:34:56.789Z"
  }
  // ... more dustbins
]
```

---

#### **POST /api/dustbins/add** - Add New Dustbin
**What to send (FormData):**
```javascript
// Form fields:
{
  "name": "Park Dustbin",
  "lat": "40.7128",
  "lng": "-74.0060", 
  "reportedBy": "John Doe"  // optional
}

// File upload:
"photo": File (required - image of dustbin)
```

**What you get back (201):**
```javascript
{
  "status": "success",
  "message": "Dustbin added successfully!",
  "data": {
    "_id": "64f8a9b2c3d4e5f6g7h8i9j2",
    "name": "Park Dustbin",
    "lat": 40.7128,
    "lng": -74.0060,
    "reportedBy": "John Doe",
    "imageUrl": "/uploads/dustbin_1694012345679.jpg",
    "createdAt": "2023-09-06T12:45:67.890Z",
    "updatedAt": "2023-09-06T12:45:67.890Z"
  }
}
```

**Errors (400/408/503):**
```javascript
{ "status": "error", "message": "Photo is mandatory!" }
{ "status": "error", "message": "Name, latitude, and longitude are required" }
{ "status": "error", "message": "Coordinates must be valid numbers" }
{ "status": "error", "message": "Image upload timed out. Try a smaller image." }
```

---

#### **POST /api/dustbins/get-bin** - Find Nearby Dustbins
**What to send:**
```javascript
{
  "lat": 40.7128,
  "lng": -74.0060
}
```

**What you get back (200):**
```javascript
[
  {
    "_id": "64f8a9b2c3d4e5f6g7h8i9j1",
    "name": "Main Street Dustbin",
    "lat": 40.7128,
    "lng": -74.0060,
    "reportedBy": "Jane Doe",
    "imageUrl": "/uploads/dustbin_1694012345678.jpg",
    "createdAt": "2023-09-06T12:34:56.789Z",
    "updatedAt": "2023-09-06T12:34:56.789Z"
  }
  // ... dustbins within ~1.5km range
]
```

**Error (400):**
```javascript
{ "message": "Coordinates required" }
```

---

### 🤖 AI CONTROLLER (`/api`)

#### **GET /api/aqi** - Get Air Quality Index
**What to send (query params):**
```
/api/aqi?latitude=40.7128&longitude=-74.0060
```

**What you get back (200):**
```javascript
{
  "status": "success",
  "data": {
    "aqi": 54,
    "status": "Moderate", 
    "description": "Air quality is acceptable.",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  }
}
```

**Error (500):**
```javascript
{ "message": "Failed to fetch AQI data" }
```

---

#### **POST /api/ai/chat** - Chat with AI
**What to send:**
```javascript
{
  "message": "What is the air quality like today?"
}
```

**What you get back (200):**
```javascript
{
  "reply": "This is a placeholder AI response to: \"What is the air quality like today?\""
}
```

**Error (500):**
```javascript
{ "message": "AI Chat failed" }
```

---

## 📊 Response Format Guide

### ✅ Success Responses
```javascript
// Most success responses follow this pattern:
{
  "status": "success",
  "data": { /* actual data */ }     // or "message": "success message"
}
```

### ❌ Error Responses  
```javascript
// Error responses:
{
  "status": "fail",     // or "status": "error"
  "message": "Human readable error description"
}
```

### 📡 HTTP Status Codes
- **200** - Success (GET, PATCH)
- **201** - Created (POST)
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (invalid/missing token)
- **404** - Not Found
- **408** - Request Timeout
- **500** - Server Error
- **503** - Service Unavailable

---

## 🛠️ Frontend Integration Tips

### **Axios Example:**
```javascript
// Login
const login = async (email, password) => {
  try {
    const response = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    throw error.response.data.message;
  }
};

// Get profile (protected)
const getProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.user;
  } catch (error) {
    throw error.response.data.message;
  }
};

// Upload dustbin with photo
const addDustbin = async (formData) => {
  try {
    const response = await axios.post('/api/dustbins/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  } catch (error) {
    throw error.response.data.message;
  }
};
```

### **Error Handling:**
```javascript
const handleApiCall = async () => {
  try {
    const result = await apiCall();
    // Handle success
  } catch (error) {
    // error contains the error message from backend
    console.error('API Error:', error);
    // Show user-friendly message
  }
};
```

---

## 🎯 Quick Start Checklist

1. **Authentication First:** Get token from `/api/auth/login`
2. **Add Auth Header:** Include `Bearer <token>` for protected routes
3. **Handle FormData:** Use `multipart/form-data` for file uploads
4. **Check Status Codes:** 200/201 = success, 400/401/500 = errors
5. **Parse Responses:** Success data in `data` field, errors in `message` field

**Happy Coding! 🚀**
