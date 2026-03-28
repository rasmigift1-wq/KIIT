
# ClimaCare — Personal Carbon Footprint Tracker

A full-stack platform to track, reduce, and manage your carbon footprint. Built for sustainable urban living — featuring AI-powered predictions, smart waste management, an eco marketplace, and real-time environmental insights.

---
## Deployment link
* **Frontend**-https://kiit-1.onrender.com/
* **Backend**-https://kiit-sw9j.onrender.com
* **AIModel**-https://kiit-aimodels.onrender.com/docs
* **Aimodel2**-https://wasteclassificationan.onrender.com/docs
## 🛠 Tech Stack

* **Frontend** — React, TypeScript, Vite, Tailwind CSS
* **Backend** — Node.js, Express.js, MongoDB, JWT
* **AI Model** — Python, FastAPI, Scikit-learn, Uvicorn
* **Admin Panel** — React, TypeScript, Vite

---

## 📂 Folder Structure

```text
ClimaCare/
├── Frontend/       # React + TypeScript (Main User App)
├── Backend/        # Node.js + Express (API Server)
├── AIModel/        # Python + FastAPI (ML Services)
├── AdminPanel/     # React + TypeScript (Admin Dashboard)
└── README.md
````

-----

## 📋 Prerequisites

  * [Node.js 18+](https://nodejs.org/)
  * [Python 3.8+](https://www.python.org/)
  * [MongoDB](https://www.mongodb.com/) (running locally or cloud URI)

-----

## 🚀 How to Run the Project

### Step 1 — Clone the Repository

```bash
git clone <repository-url>
cd ClimaCare
```

### Step 2 — Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file inside `Backend/` (see [Environment Variables](https://www.google.com/search?q=%23environment-variables) below), then:

```bash
npm run dev
```

> Runs on **http://localhost:5000**

### Step 3 — Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file inside `Frontend/` (see [Environment Variables](https://www.google.com/search?q=%23environment-variables) below), then:

```bash
npm run dev
```

> Runs on **http://localhost:5173**

### Step 4 — AI Model Setup

```bash
cd AIModel
python -m venv venv
```

**Activate the virtual environment:**

  * **Windows:** `venv\Scripts\activate`
  * **macOS/Linux:** `source venv/bin/activate`

<!-- end list -->

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

> Runs on **http://localhost:8000**

### Step 5 — Admin Panel Setup

```bash
cd AdminPanel
npm install
npm run dev
```

> Runs on **http://localhost:5174**

-----

## 🔐 Environment Variables

### Backend — `Backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/climacare
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend — `Frontend/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_AI_URL=http://localhost:8000
```

-----

## ✨ Key Features

  * 🗑️ **Smart Dustbin Locator** — Find and track nearby dustbins via geolocation.
  * 🌱 **Carbon Footprint Tracker** — Log and monitor your daily carbon emissions.
  * 🛣️ **Route Optimization** — AI-optimized waste collection routes.
  * 🛒 **Eco Marketplace** — Buy and sell recycled/eco-friendly products.
  * 🤖 **AI Predictions** — ML models for carbon, food waste, vehicle, and hospital surge prediction.
  * 🔐 **Admin Verification Panel** — Manage users, dustbins, and platform data.

-----

## 📝 Notes for Judges

Start all services in this order:

1.  ✅ **MongoDB** — Ensure it's running before anything else.
2.  ✅ **Backend** — `cd Backend && npm run dev` → **http://localhost:5000**
3.  ✅ **AI Model** — Activate venv, then `uvicorn main:app --host 0.0.0.0 --port 8000 --reload` → **http://localhost:8000**
4.  ✅ **Frontend** — `cd Frontend && npm run dev` → **http://localhost:5173**
5.  ✅ **Admin Panel (Optional)** — `cd AdminPanel && npm run dev` → **http://localhost:5174**

> [\!IMPORTANT]
> The Backend and MongoDB must be running before launching the Frontend. The AI Model must be running for prediction features to work.

> [\!TIP]
> **⚡ Note for Judges:** The AI model is also hosted on Render. To avoid cold-start delays, **open this link in a separate tab** before testing the app — it will warm up the server in the background:
> 👉 [https://wasteclassificationan.onrender.com/docs](https://wasteclassificationan.onrender.com/docs)
>
> ⚠️ **Important:** This endpoint requires an **image file upload**, not JSON. If you test it via the Swagger UI (`/docs`):
>
> 1.  Click on the endpoint → **Try it out**
> 2.  Under **Request body**, change media type to `multipart/form-data`
> 3.  Click **Choose File** and upload any image (`.jpg`, `.png`, etc.)
> 4.  Hit **Execute**
>
> Sending raw JSON will result in a `Validation Error` — always upload an image file.

-----

*Last Updated: March 2026*

© 2026 Team **Avengers**. All rights reserved.

