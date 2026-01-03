# Mobile QR Code Setup Guide

## Problem
When scanning QR codes on mobile devices, you might see "This site can't be reached" error because the QR code points to `localhost` which only works on the same computer.

## Solutions

### Option 1: Use Local Network IP (Recommended for Development)

1. **Find your computer's IP address:**
   
   **Windows:**
   - Open Command Prompt (cmd)
   - Type: `ipconfig`
   - Look for "IPv4 Address" under your WiFi adapter
   - Example: `192.168.1.100`

   **Mac:**
   - Open Terminal
   - Type: `ifconfig | grep "inet "`
   - Look for an address starting with 192.168 or 10.

   **Linux:**
   - Open Terminal
   - Type: `ip addr show`
   - Look for an address starting with 192.168 or 10.

2. **Use the Auto Detect feature:**
   - When creating a QR code, click "Auto Detect" button
   - The app will try to automatically find your IP address

3. **Manual setup:**
   - Enter your IP address in the format: `http://192.168.1.100:8080`
   - Make sure your phone is on the same WiFi network

### Option 2: Deploy to a Public Domain (Recommended for Production)

1. **Deploy your app to a hosting service:**
   - Vercel: `vercel --prod`
   - Netlify: Connect your GitHub repository
   - Heroku: Deploy using Git

2. **Set environment variable:**
   - Create a `.env` file in your project root
   - Add: `VITE_PUBLIC_BASE_URL=https://your-domain.com`

3. **Update QR codes:**
   - All QR codes will automatically use the public URL

### Option 3: Use ngrok for Local Development

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start your app:**
   ```bash
   npm run dev
   ```

3. **In another terminal, expose your local server:**
   ```bash
   ngrok http 8080
   ```

4. **Use the ngrok URL:**
   - Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)
   - Use this URL in the QR code setup

## Testing

1. Generate a QR code with the correct URL
2. Scan it with your phone's camera or QR scanner app
3. The phone should open the AgriChain app in the browser
4. You should see the product traceability page

## Troubleshooting

- **"This site can't be reached"**: The URL in the QR code is not accessible from your phone
- **"Connection refused"**: The server is not running or the port is wrong
- **"Network error"**: Check that both devices are on the same WiFi network

## Security Note

When using local network IP addresses, make sure you're on a trusted network. The app will be accessible to anyone on the same network.

