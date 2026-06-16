# Snap QR Fielding System

A Node.js/Express application for creating QR codes, verifying payments, and collecting form submissions.

## Local Development

### Prerequisites
- Node.js 18.x
- npm 9.x

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

The server will run on `http://localhost:3000`

## Deployment

### Option 1: Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Option 2: Railway

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Select this repo
4. Railway auto-detects Node.js and deploys
5. Add `PORT` environment variable if needed

### Option 3: Render

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Build command: `npm install`
5. Start command: `npm start`

### Option 4: Docker (AWS, DigitalOcean, etc.)

```bash
# Build image
docker build -t snap-qr .

# Run locally
docker run -p 3000:3000 snap-qr

# Push to registry and deploy
```

## Environment Variables

- `PORT` - Server port (default: 3000)

## Features

- QR code generation for session URLs
- Payment verification form
- Data collection form
- Admin dashboard showing session count

## Project Structure

```
.
├── server.js       # Main application file
├── package.json    # Dependencies and scripts
├── Dockerfile      # Container configuration
├── Procfile        # Heroku deployment config
└── README.md       # This file
```

## Notes

- Sessions are stored in memory (lost on restart)
- No authentication on admin endpoint
- No input validation currently implemented
- Consider adding database persistence for production use
