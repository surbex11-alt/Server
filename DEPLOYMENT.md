# Snap QR Fielding System - Deployment Guide

A Node.js/Express application with MongoDB for creating QR codes, verifying payments, and collecting form submissions.

## 📋 Prerequisites

- Node.js 18.x
- npm 9.x
- MongoDB Atlas account (or local MongoDB)
- GitHub account
- Hosting platform account (Heroku, Railway, Render, or AWS)

## 🚀 Quick Start

### Local Development

```bash
# Clone repository
git clone https://github.com/surbex11-alt/Server.git
cd Server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Edit .env with your MongoDB connection
nano .env

# Run locally
npm run dev
```

Visit: http://localhost:3000

## 🌐 Production Deployment Options

### Option 1: Railway (Recommended - Fastest)

**Why Railway?** Auto-deploys from GitHub, free MongoDB included

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select `surbex11-alt/Server`
5. Railway auto-detects Node.js
6. Add environment variable:
   - Key: `MONGODB_URI`
   - Value: Your MongoDB connection string
7. Deploy automatically

**Get MongoDB Connection String:**
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create free cluster
- Click "Connect"
- Copy "Connect your application" string
- Format: `mongodb+srv://username:password@cluster.mongodb.net/snap-qr`

---

### Option 2: Heroku

**Setup:**

```bash
# Install Heroku CLI
brew install heroku  # macOS
# or download from https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MongoDB Atlas connection
heroku config:set MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/snap-qr"

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

---

### Option 3: Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New Web Service"
4. Select your GitHub repo
5. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add environment variable `MONGODB_URI`
7. Deploy

---

### Option 4: AWS EC2 (Full Control)

**Basic Setup:**

```bash
# Connect to EC2 instance
ssh -i your-key.pem ec2-user@your-instance.com

# Update system
sudo yum update -y
sudo yum install -y nodejs npm git

# Clone repository
git clone https://github.com/surbex11-alt/Server.git
cd Server

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Add MongoDB URI

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start server.js --name "snap-qr"
pm2 startup
pm2 save

# View logs
pm2 logs snap-qr
```

---

### Option 5: DigitalOcean App Platform

1. Go to [DigitalOcean](https://www.digitalocean.com)
2. Create app from GitHub
3. Select repository
4. Set build command: `npm install`
5. Set run command: `npm start`
6. Add environment variable `MONGODB_URI`
7. Deploy

---

## 🗄️ MongoDB Setup

### MongoDB Atlas (Recommended for Cloud)

1. **Create Account:** https://www.mongodb.com/cloud/atlas
2. **Create Cluster:**
   - Click "Create a Cluster"
   - Choose Free tier
   - Select region
   - Click "Create"
3. **Add Connection String:**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
4. **Format for `.env`:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/snap-qr?retryWrites=true&w=majority
   ```

### Local MongoDB

```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Linux (Ubuntu)
sudo apt-get install -y mongodb

# Windows
# Download from: https://www.mongodb.com/try/download/community
```

Then use in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/snap-qr
```

---

## 🔐 Environment Variables

Create `.env` file with:

```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/snap-qr

# Server
PORT=3000
NODE_ENV=production
```

---

## 📊 Features

- ✅ QR code generation for sessions
- ✅ Payment verification
- ✅ Form data collection
- ✅ Admin dashboard with analytics
- ✅ MongoDB persistence
- ✅ Real-time statistics API
- ✅ 30-minute session expiry

---

## 📍 Routes

- `GET /` — Home page
- `GET /api/stats` — Dashboard statistics (JSON)
- `POST /create-session` — Create new session
- `GET /session/:id` — Payment verification page
- `POST /verify/:id` — Verify payment
- `GET /form/:id` — Fielding form
- `POST /submit/:id` — Submit form
- `GET /admin` — Admin dashboard

---

## 🛠️ Troubleshooting

### MongoDB Connection Error
```
❌ Error: connect ECONNREFUSED
```
- Check MongoDB URI in `.env`
- Ensure MongoDB Atlas cluster is running
- Verify IP whitelist allows your IP

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Build Failing on Deployment
```bash
# Clear cache and rebuild
npm cache clean --force
npm install
npm start
```

---

## 📈 Scaling Tips

1. **Add Caching:** Use Redis for session caching
2. **Load Balancing:** Use Nginx reverse proxy
3. **Database Indexing:** Add indexes to frequently queried fields
4. **CDN:** Serve static files via CloudFlare
5. **Monitoring:** Add Sentry for error tracking

---

## 🔗 Useful Links

- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Railway Docs](https://docs.railway.app)
- [Heroku Docs](https://devcenter.heroku.com)
- [Express.js Docs](https://expressjs.com)
- [Mongoose Docs](https://mongoosejs.com)

---

## 📞 Support

For issues:
1. Check `.env` variables
2. Check MongoDB connection
3. Review logs: `heroku logs --tail` or `npm start`
4. Verify all dependencies installed: `npm install`

---

**Your app is ready for production! 🚀**
