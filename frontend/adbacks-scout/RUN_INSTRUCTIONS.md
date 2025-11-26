# How to Run the Frontend Application

## Quick Start

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend/adbacks-scout
   ```

2. **Install dependencies (if not already installed):**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - The server will start on `http://localhost:5173` (or the next available port)
   - Look for the output message: `Local: http://localhost:5173/`
   - Open this URL in your browser

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Notes

- The app is configured with **Tailwind CSS v4** and should display all styles correctly
- The app runs in **DEMO MODE** by default (no backend connection needed)
- You can login with any credentials in demo mode
- The development server will automatically reload when you make changes

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running, or:
```bash
pkill -f vite
```



