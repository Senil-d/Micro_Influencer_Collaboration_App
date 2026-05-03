# Micro-Influencer Collaboration System

# 01) GitHub Repository Link

GitHub Repository: https://github.com/Senil-d/Micro_Influencer_Collaboration_App.git

# 02) Team Details

Group Number: WD-IT-02
Member : IT21838934 – S.D. Wijesundara – SE2020

# 03) Deployment Details

Backend URL: https://influencer-collab-api.onrender.com

# 04) Project Overview

This project is a Full Stack Mobile Application designed to connect brands with micro-influencers for collaboration opportunities.

The system allows:

- Brand users to create collaboration campaigns
- Influencers to browse and apply for collaborations
- Brands to manage applications (accept/reject)
- Secure authentication using JWT
- File/image handling using Firebase storage

Frontend: React Native (Expo SDK 54)
Backend: Node.js + Express.js
Database: MongoDB Atlas
Authentication: JWT + Role-Based Access Control

# 05) Core Features

- User Registration and Login
- Role-based access (Brand / Influencer)
- Collaboration CRUD operations
- Application system (apply, accept, reject)
- Secure RESTful API
- Mobile responsive UI using React Native
- Firebase image upload integration

# 06) Technologies Used

Frontend:

- React Native (Expo SDK 54)
- Axios
- React Navigation

Backend:

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs

Cloud Services:

- MongoDB Atlas
- Firebase Storage (for image uploads)

# 07) How to Run the Project

Backend:

1. npm install
2. npm run dev
3. Configure .env file with MONGO_URI and JWT_SECRET

Frontend:

1. npm install
2. npx expo start
3. Scan QR code using Expo Go app

8)  Notes

- Backend deployed in Render
- Mobile app connects to live backend API (no localhost)
- Firebase is used for image storage
- All API calls are handled using Axios
- Role-based access controls system permissions
