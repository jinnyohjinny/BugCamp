# BugCamp Frontend

A modern, responsive Single Page Application (SPA) for the BugCamp vulnerability training platform.

## Features

### 🚀 SPA Navigation System
- **Client-side routing** using React Router with hash-based navigation
- **Hash-based URLs** (e.g., `#level-01`, `#level-02`) for bookmarkable and shareable links
- **No page reloads** when switching between levels or sections
- **Smooth transitions** between different views using Framer Motion

### 🎨 Modern UI/UX
- **Responsive design** that works on desktop, tablet, and mobile devices
- **Clean card-based layout** for lab content using Tailwind CSS
- **Smooth animations** and micro-interactions throughout the interface
- **Dark theme** optimized for security professionals

### 📱 Responsive Navigation
- **Desktop**: Full tab navigation with previous/next buttons and progress indicators
- **Mobile**: Compact navigation with level pills and swipe-friendly controls
- **Sticky navigation** that stays visible while scrolling
- **Progress tracking** showing current level and completion status

### 🔧 Lab Management
- **Dynamic content loading** from `labs.json`
- **Real-time status updates** for running/stopped labs
- **Progress tracking** with completion indicators
- **Local storage persistence** for completed labs

### 🎯 Key Components

#### Navigation Component
- Tab-style navigation between levels
- Previous/next navigation buttons
- Progress indicators and level counters
- Responsive design for mobile and desktop

#### LevelView Component
- Individual level display with labs grid
- Lab cards with vulnerability information
- Start/stop controls for lab instances
- Completion tracking and progress bars

#### ProgressBar Component
- Overall progress across all levels
- Visual progress bar with animations
- Completion statistics

## Technical Stack

- **React 19** with TypeScript
- **React Router** for client-side routing
- **Framer Motion** for smooth animations
- **Tailwind CSS** for responsive styling
- **Vite** for fast development and building

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Navigation.tsx      # Main navigation component
│   ├── LevelView.tsx       # Individual level display
│   ├── ProgressBar.tsx     # Progress tracking
│   └── ...
├── types/
│   └── lab.ts             # TypeScript interfaces
├── lib/
│   └── api.ts             # API utilities
├── App.tsx                # Main application with routing
└── main.tsx               # Application entry point
```

## Navigation System

### Hash-Based Routing
The application uses hash-based routing for seamless navigation:
- `#level-01` - Level 1 labs
- `#level-02` - Level 2 labs
- URLs can be bookmarked and shared directly

### Responsive Design
- **Desktop**: Full tab navigation with all levels visible
- **Mobile**: Compact navigation with level indicators
- **Tablet**: Adaptive layout that scales appropriately

### Smooth Transitions
- Page transitions use Framer Motion for smooth animations
- Content fades in/out with directional movement
- Navigation elements animate smoothly between states

## Customization

### Adding New Levels
1. Update `labs.json` with new level data
2. The navigation system automatically adapts
3. Hash routing works immediately for new levels

### Styling
- Uses Tailwind CSS utility classes
- Custom CSS in `index.css` for specific utilities
- Responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`

### Animations
- Framer Motion variants for consistent animations
- Staggered animations for list items
- Hover and tap animations for interactive elements

## Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Features

- **Code splitting** with Vite
- **Optimized builds** for production
- **Efficient re-renders** with React 19
- **Smooth animations** with Framer Motion

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Implement responsive design patterns
4. Add smooth animations for new features
5. Test on multiple screen sizes

## License

This project is part of BugCamp, a vulnerability training platform.