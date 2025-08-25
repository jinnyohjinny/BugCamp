# BugCamp Frontend

A modern React frontend for the BugCamp vulnerability training platform.

## Features

- **Modern UI**: Built with React, TypeScript, Tailwind CSS, and shadcn/ui
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Smooth Animations**: Enhanced with Framer Motion
- **Lab Management**: Deploy/destroy labs with real-time status updates
- **Progress Tracking**: Visual progress bar and completion tracking
- **Local Storage**: Persists "hacked" status across sessions

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Framer Motion** for animations
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API server running on port 3001 (optional for full functionality)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to [http://localhost:5173](http://localhost:5173)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## API Integration

The frontend expects a backend API server running on `http://localhost:3001` with the following endpoints:

- `POST /api/make` - Deploy/destroy labs (with command and labId in body)
- `GET /api/status?lab=<lab-id>` - Get lab status

**Note**: Lab deployment can take several minutes for Docker image building. The API has a 10-minute timeout, but deployments continue running in the background. If you get a timeout error, wait a few minutes and check the status.

If the API is not available, the frontend will still work but deploy/destroy functionality will show errors.

## Components

- **ProgressBar**: Shows overall completion progress
- **LabCard**: Individual lab cards with deploy/destroy buttons and hacked checkbox
- **LevelSection**: Groups labs by level with completion stats
- **App**: Main application component with header and layout

## Data Format

The frontend loads lab data from `src/labs.json` with the following structure:

```json
{
  "levels": [
    {
      "name": "level-01",
      "description": "Basic vulnerability labs",
      "labs": [
        {
          "name": "jwt-1",
          "vulnerability": "JWT Algorithm Confusion",
          "description": "Lab description",
          "port": 8080,
          "objective": "Lab objective",
          "category": "Authentication"
        }
      ]
    }
  ]
}
```

## Local Storage

The app uses localStorage to persist which labs have been marked as "hacked":
- Key: `bugcamp-hacked-labs`
- Value: Array of lab IDs that have been completed