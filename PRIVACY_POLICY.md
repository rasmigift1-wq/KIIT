

## 1. Introduction
Welcome to **ClimaCare**. We are committed to protecting your personal data and your right to privacy. This policy explains how we collect, use, and safeguard your information when you use our platform, including our AI-powered waste classification and carbon tracking services.

---

## 2. Information We Collect
We collect information that you provide directly to us through the ClimaCare interface:

* **Account Information:** Name, email address, and encrypted passwords (managed via JWT).
* **Environmental Logs:** Data regarding your daily activities, mileage, and utility usage used to calculate your carbon footprint.
* **Geolocation Data:** Your real-time location is used strictly for the **Smart Dustbin Locator** and route optimization features.
* **Image Data:** Images uploaded to the AI Model for waste classification. 
    > **Note:** Images are processed via our FastAPI service and may be temporarily stored on **Cloudinary** for analysis.
* **Technical Data:** IP addresses and browser types collected for security and analytics purposes via our Node.js/Express backend.

---

## 3. How We Use Your Information
We use the collected data to:
* Provide accurate **Carbon Footprint Predictions**.
* Locate the nearest waste disposal units based on your current coordinates.
* Facilitate transactions within the **Eco Marketplace**.
* Improve our Machine Learning models for waste classification and surge prediction.
* Authenticate your access to the **Admin Panel** or User Dashboard.

---

## 4. Data Storage & Security
* **Databases:** We use **MongoDB** to store user profiles and environmental logs.
* **Authentication:** We use **JSON Web Tokens (JWT)** to ensure that your session remains secure and private.
* **Cloud Storage:** Media files (like waste images) are managed through **Cloudinary** with secure API keys.
* **Encryption:** Sensitive data, such as passwords, are hashed before being stored in the database.

---

## 5. Third-Party Services
ClimaCare integrates with the following third-party providers:
* **Cloudinary:** For image hosting and processing.
* **Render:** For hosting the AI Model and web services.
* **MongoDB Atlas:** For cloud database management.
* **Leaflet/OpenStreetMap:** For rendering geolocation maps.

Each of these providers has its own privacy policy regarding how they handle data.

---

## 6. Data Retention
We retain your personal information only for as long as necessary to provide the services outlined in this project. For this prototype, users may request data deletion by contacting the project administrators.

---

## 7. Children's Privacy
ClimaCare does not knowingly collect or solicit personal information from anyone under the age of 13. If we learn that we have collected personal information from a child, we will delete that information as quickly as possible.

---

## 8. Changes to This Policy
We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.

---

## 9. Contact Us
If you have any questions about this Privacy Policy, please reach out to **Team Avengers** through our repository's issue tracker or project lead.
