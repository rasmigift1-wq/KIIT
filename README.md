# ClimaCare - Comprehensive Climate Action Platform

## 🌍 Project Overview

ClimaCare is a comprehensive climate action platform that combines environmental monitoring, waste management, and AI-driven insights to promote sustainable urban living. The project consists of four main components: Frontend (React), Backend (Node.js/Express), AI Model (Python/FastAPI), and Admin Panel (React).

---

## 🏗️ Project Architecture

```
ClimaCare/
├── Frontend/          # React + TypeScript + Vite (Main User Application)
├── Backend/           # Node.js + Express + MongoDB (API Server)
├── AIModel/           # Python + FastAPI + ML Models (AI Services)
├── AdminPanel/        # React + TypeScript (Admin Dashboard)
└── README.md          # This documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- MongoDB
- Git

### Environment Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd ClimaCare
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   cp .env.example .env
   # Configure .env with your MongoDB URI and JWT secrets
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   cp .env.example .env
   # Configure .env with your API URL
   npm run dev
   ```

4. **AI Model Setup**
   ```bash
   cd ../AIModel
   python -m venv venv
   # On Windows: venv\Scripts\activate
   # On macOS/Linux: source venv/bin/activate
   pip install -r requirements.txt
   python main.py
   ```
**AI Model will run on:** `http://localhost:8000`

5. **Admin Panel Setup**
   ```bash
   cd ../AdminPanel
   npm install
   cp .env.example .env  # If .env.example exists, otherwise create .env
   # Configure .env with your API URL
   npm run dev
   ```
**Admin Panel will run on:** `http://localhost:5174`

---

## 📁 Project Structure Deep Dive

### Frontend Structure
```
Frontend/src/
├── components/        # Reusable UI components
│   ├── DashboardLayout.tsx
│   ├── GlassCard.tsx
│   └── [57 other components]
├── pages/            # Main application pages
│   ├── Dashboard.tsx
│   ├── CollectGarbage.tsx
│   ├── Marketplace.tsx
│   ├── CarbonFootprint.tsx
│   └── [9 other pages]
├── context/          # React Context for state management
│   └── AppContext.tsx
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
└── types/            # TypeScript type definitions
```

### Backend Structure
```
Backend/src/
├── controller/       # Route handlers
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── dustbin.controller.js
│   ├── product.controller.js
│   └── hospital.controller.js
├── models/           # Mongoose schemas
│   ├── user.model.js
│   ├── dustbin.model.js
│   ├── product.model.js
│   └── hospital.model.js
├── routes/           # API routes
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── dustbin.routes.js
│   ├── product.routes.js
│   └── hospital.routes.js
├── middleware/       # Express middleware
│   ├── auth.middleware.js
│   └── checkauth.js
└── server.js         # Main server file
```

### AI Model Structure
```
AIModel/
├── main.py           # FastAPI server
├── models/           # Trained ML models
│   ├── carbon_model.pkl
│   ├── food_model.pkl
│   ├── hospital_model.pkl
│   └── vehicle_model.pkl
├── datasets/         # Training datasets
├── notebooks/        # Jupyter notebooks for development
│   ├── carbondataset.ipynb
│   ├── fooddataset.ipynb
│   ├── Hospital Surge Prediction.ipynb
│   └── vehicle.ipynb
└── requirements.txt  # Python dependencies
```

---

## 🔧 Development Workflow



## 🔧 Development Workflow
### 1. Feature Development Process

#### Step 1: Planning
- Create feature branch: `git checkout -b feature/your-feature-name`
- Define API endpoints in Backend
- Plan UI components in Frontend
- Identify ML model requirements



## 🔧 Development Workflow
#### Step 2: Backend Development
1. **Create Model** (if needed)
   ```javascript
   // src/models/newModel.model.js
   import mongoose from 'mongoose';
   
   const newModelSchema = new mongoose.Schema({
     // Define your schema
   }, { timestamps: true });
   
   export default mongoose.model('NewModel', newModelSchema);
   ```

2. **Create Controller**
   ```javascript
   // src/controller/newModel.controller.js
   export const createNewModel = async (req, res) => {
     // Implementation
   };
   ```

3. **Create Routes**
   ```javascript
   // src/routes/newModel.routes.js
   import express from 'express';
   import { createNewModel } from '../controller/newModel.controller.js';
   
   const router = express.Router();
   router.post('/', createNewModel);
   ```

4. **Update Server**
   ```javascript
   // src/server.js
   import newModelRoutes from './routes/newModel.routes.js';
   app.use('/api/newmodel', newModelRoutes);
   ```


## 🔧 Development Workflow
#### Step 3: Frontend Development
1. **Create Component**
   ```tsx
   // src/components/NewComponent.tsx
   import React from 'react';
   
   const NewComponent = () => {
     return <div>New Component</div>;
   };
   ```

2. **Create Page**
   ```tsx
   // src/pages/NewPage.tsx
   import NewComponent from '@/components/NewComponent';
   
   const NewPage = () => {
     return <NewComponent />;
   };
   ```

3. **Update Routing**
   ```tsx
   // src/App.tsx
   <Route path="/newpage" element={<NewPage />} />
   ```

#### Step 4: AI Model Integration (if needed)
1. **Update FastAPI Endpoint**
   ```python
   # main.py
   @app.post("/predict/new-feature")
   async def predict_new_feature(data: dict):
       # ML model prediction
       return {"prediction": result}
   ```

2. **Test Integration**
   ```bash
   # Test AI endpoint
   curl -X POST http://localhost:8000/predict/new-feature \
        -H "Content-Type: application/json" \
        -d '{"data": "test"}'
   ```

### 2. Code Quality Standards

#### Frontend Standards
- Use TypeScript for all new components
- Follow React best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add loading states for async operations

#### Backend Standards
- Use async/await for all async operations
- Implement proper error handling with try-catch
- Validate input data
- Use meaningful status codes
- Add proper logging

#### AI Model Standards
- Document model parameters and performance
- Include data preprocessing steps
- Handle edge cases gracefully
- Provide confidence scores when applicable

### 3. Testing Strategy

#### Frontend Testing
```bash
cd Frontend
npm run test        # Run unit tests
npm run test:watch  # Watch mode
```

#### Backend Testing
- Use Postman/Thunder Client for API testing
- Test all endpoints with various inputs
- Verify authentication and authorization

#### AI Model Testing
- Test predictions with sample data
- Validate model accuracy
- Monitor performance metrics

---

## 🔄 Git Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature development
- `hotfix/*` - Critical bug fixes

### Commit Convention
```
type(scope): description

feat: add new feature
fix: fix bug
docs: update documentation
style: code formatting
refactor: code refactoring
test: add tests
chore: build process or auxiliary tool changes
```

### Example Workflow
```bash
# 1. Create feature branch
git checkout -b feature/user-authentication

# 2. Make changes and commit
git add .
git commit -m "feat: implement user authentication"

# 3. Push and create PR
git push origin feature/user-authentication

# 4. After review, merge to develop
git checkout develop
git merge feature/user-authentication

# 5. Deploy to staging
git push origin develop
```

---

## 🚀 Deployment Guide

### Frontend Deployment
```bash
cd Frontend
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd Backend
npm install --production
npm start
```

### AI Model Deployment
```bash
cd AIModel
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_AI_URL=http://localhost:8000
```

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/climacare
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 📊 Key Features Implementation

### 1. User Authentication
- JWT-based authentication
- Profile management with mobile numbers
- Secure password hashing with bcrypt

### 2. Dustbin Management
- CRUD operations for dustbins
- Image upload with Cloudinary
- Geolocation-based tracking
- Route optimization for collection

### 3. Marketplace
- Product listings with images
- Seller contact information
- Buy/sell functionality
- Location-based filtering

### 4. Hospital Finder
- Nearby hospital search
- Geolocation-based results
- Emergency contact information

### 5. Carbon Footprint Calculator
- AI-powered carbon predictions
- Personalized recommendations
- Progress tracking

### 6. AI Models
- Carbon emission prediction
- Food waste analysis
- Hospital surge prediction
- Vehicle emission analysis

---

## 🔍 Monitoring and Debugging

### Frontend Debugging
- Use React DevTools
- Check browser console for errors
- Use Network tab for API calls
- Implement error boundaries

### Backend Debugging
- Use console.log for debugging
- Check MongoDB logs
- Monitor API response times
- Use Postman for endpoint testing

### AI Model Debugging
- Monitor model predictions
- Check data preprocessing
- Validate input formats
- Track model performance

---

## 📱 API Documentation

### Authentication Endpoints
```
POST /api/auth/signup    - User registration
POST /api/auth/login     - User login
POST /api/auth/logout    - User logout
GET  /api/auth/checkAuth - Verify authentication
```

### User Endpoints
```
GET    /api/users/profile      - Get user profile
PUT    /api/users/profile      - Update user profile
DELETE /api/users/profile      - Delete user account
```

### Dustbin Endpoints
```
GET    /api/dustbins           - Get all dustbins
POST   /api/dustbins/add       - Add new dustbin
PUT    /api/dustbins/:id       - Update dustbin
DELETE /api/dustbins/:id       - Delete dustbin
POST   /api/dustbins/get-bin   - Get nearby dustbins
```

### Product Endpoints
```
GET    /api/products           - Get all products
POST   /api/products           - Create product
GET    /api/products/:id/contact - Get seller contact
PATCH  /api/products/:id/buy   - Buy product
DELETE /api/products/:id       - Delete product
```

### Hospital Endpoints
```
GET    /api/hospital/all       - Get all hospitals
GET    /api/hospital/nearby    - Get nearby hospitals
```

### Route Optimization
```
POST   /api/routes/optimize    - Get optimized collection route
```

---

## 🤝 Team Collaboration

### Code Review Process
1. Create pull request for all changes
2. Request review from at least one team member
3. Address all review comments
4. Ensure tests pass
5. Merge to develop branch

### Communication Channels
- Use GitHub Issues for bug tracking
- Use GitHub Discussions for questions
- Standup meetings for progress updates
- Code reviews for quality assurance

### Documentation Updates
- Update README.md for major changes
- Document new API endpoints
- Update workflow.md for process changes
- Maintain inline code comments

---

## 🛠️ Troubleshooting Common Issues

### Frontend Issues
- **CORS Errors**: Ensure backend CORS is configured
- **API Not Found**: Check API_URL in .env
- **Build Failures**: Check TypeScript errors
- **Routing Issues**: Verify React Router setup

### Backend Issues
- **Database Connection**: Check MongoDB URI
- **Authentication Failures**: Verify JWT secrets
- **File Upload Issues**: Check Cloudinary config
- **Server Crashes**: Check error logs

### AI Model Issues
- **Import Errors**: Check Python environment
- **Model Not Loading**: Verify model file paths
- **Prediction Errors**: Check input data format
- **Performance Issues**: Monitor resource usage

---

## 📈 Performance Optimization

### Frontend Optimization
- Use React.memo for expensive components
- Implement code splitting with lazy loading
- Optimize images and assets
- Use caching strategies

### Backend Optimization
- Implement database indexing
- Use Redis for caching
- Optimize API response times
- Implement rate limiting

### AI Model Optimization
- Use model quantization
- Implement batch processing
- Optimize data preprocessing
- Monitor model performance

---

## 🔒 Security Best Practices

### Frontend Security
- Sanitize user inputs
- Use HTTPS in production
- Implement proper authentication
- Secure sensitive data

### Backend Security
- Validate all inputs
- Use parameterized queries
- Implement rate limiting
- Secure JWT tokens

### Data Protection
- Encrypt sensitive data
- Use secure file uploads
- Implement proper logging
- Follow GDPR guidelines

---

## 📚 Resources and References

### Documentation
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

### Tools and Libraries
- [Tailwind CSS](https://tailwindcss.com/)
- [Leaflet](https://leafletjs.com/)
- [Cloudinary](https://cloudinary.com/)
- [Scikit-learn](https://scikit-learn.org/)

### Learning Resources
- [React Best Practices](https://react.dev/learn)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [MongoDB Best Practices](https://www.mongodb.com/blog/post/best-practices-for-mongodb)
- [ML Model Deployment](https://www.mlflow.org/docs/latest/index.html)

---

## 🎯 Future Enhancements

### Planned Features
- Real-time notifications
- Advanced analytics dashboard
- Mobile app development
- IoT device integration
- Enhanced AI predictions

### Technical Improvements
- Microservices architecture
- Advanced caching strategies
- Real-time data synchronization
- Enhanced security measures
- Performance monitoring

---

## 📞 Support and Contact

### Team Roles
- **Frontend Developer**: React/TypeScript development
- **Backend Developer**: Node.js/Express development
- **AI/ML Engineer**: Model development and deployment
- **DevOps Engineer**: Deployment and infrastructure

### Getting Help
- Check this documentation first
- Search existing GitHub issues
- Create new issue with detailed description
- Tag relevant team members


---

## ⚖️ Legal Notice & Copyright

> **IMPORTANT:** All rights, titles, and interests in and to this project are the sole and exclusive property of **Team Avengers**.

### 🚫 Restricted Use & Intellectual Property
Copyright © 2026 **Team Avengers**. All rights reserved. 

The source code, documentation, assets, and design logic contained within this repository are proprietary. Unauthorized copying, modification, distribution, or any form of use—whether in part or in whole—is **strictly prohibited** without express written permission from the official representatives of Team Avengers.

### ⚠️ Enforcement & Consequences
Any unauthorized use of this project may lead to:
* **Legal Action:** We reserve the right to pursue litigation to protect our intellectual property rights.
* **DMCA Takedowns:** Immediate filing of formal notices to hosting platforms for the removal of infringing content.
* **Legal Liabilities:** Recovery of damages, lost revenue, and all associated legal fees incurred during enforcement.

---

*Last Updated: March 2026*
*Version: 1.0.0*
