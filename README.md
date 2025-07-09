# 💬 ByteBubble

ByteBubble is a modern, secure, and real-time chat application designed for seamless communication through messaging, media sharing, voice updates, and group collaboration.

## 🚀 Features

- 💬 Real-Time Messaging with typing indicators
- 🖼️ Media Sharing (images, videos, documents)
- 🎤 Voice & Audio Messaging with waveform visualization
- 🟢 Online Presence, Group Channels & Collaboration
- 🔔 Smart Notifications & Powerful Search
- 🔒 End-to-End Privacy Controls and User Settings

## 🛠️ Tech Stack

### ⚙️ Frontend

- React
- Tailwind CSS
- Redux Toolkit (RTK & RTK Query)
- GSAP, Framer Motion
- Swiper.js

### 🖥️ Backend

- Node.js + Express
- MongoDB + GridFS
- Socket.IO (for real-time communication)
- Redis (for caching)
- Cloudinary (for media)
- Nodemailer (for emails)
- Passport.js (authentication)

---

## 📁 Project Structure

```bash
bytebubble/
├── client/     # React Frontend
│   └── ...
├── server/     # Node.js Backend
│   └── ...
└── README.md


# 📦 Installation

- 1. Clone the Repository

    git clone https://github.com/NikhilDaivanapally/ByteBubble.git
    cd ByteBubble

- 2. Setup Environment Variables

    Create .env files in  server/ directory:

    env

    PORT=8000
    MONGO_DB_URL=your_mongodb_url
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    SENDER_EMAIL=your_email
    APP_PASSWORD=your_app_password
    REDIS_HOST=your_redis_host_url
    REDIS_PASSWORD=your_redis_password
    GOOGLE_CLIENT_ID=your_google_clientId
    GOOGLE_CLIENT_SECRET=your_google_clientSecret
    REDIS_PORT=your_redis_port
    SESSION_SECRET=generate_random_secret

- 3. Install Dependencies

    # Install frontend dependencies
    cd client
    npm install

    # Install backend dependencies
    cd ../server
    npm install

▶️ Running the Application
    Frontend

    cd client
    npm run dev
    
    Backend

    cd server
    npm run start:dev


```
