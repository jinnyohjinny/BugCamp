# BugCamp Project Structure

This document describes the organization and structure of the BugCamp project.

## 📁 Root Directory Structure

```
bugcamp/
├── 📁 frontend/           # React frontend application
├── 📁 labs/              # Vulnerability lab containers
├── 📁 attacker-server/   # Centralized attack tools server
├── 📁 docs/              # Project documentation
├── 📁 scripts/           # Utility and startup scripts
├── 📄 api-server.js      # Node.js API server
├── 📄 Makefile           # Lab management commands
├── 📄 labs.json          # Lab configuration and metadata
├── 📄 package.json       # Root project dependencies
├── 📄 .gitignore         # Git ignore patterns
└── 📄 README.md          # Main project documentation
```

## 🔧 Core Components

### Frontend (`frontend/`)
- **React 19** application with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components for UI elements
- **Framer Motion** for animations
- **Vite** for development and building

### API Server (`api-server.js`)
- **Express.js** server for backend operations
- **Makefile integration** for lab management
- **Docker status monitoring** for lab containers
- **CORS enabled** for frontend communication

### Lab Management (`Makefile`)
- **Automated deployment** of vulnerability labs
- **Docker container management**
- **Network isolation** with `labnet`
- **Attacker server integration**

### Labs (`labs/`)
- **Level-based organization** (level-01, level-02, etc.)
- **Individual lab directories** with Docker configurations
- **Vulnerability-specific applications**
- **Port isolation** for each lab

## 🚀 Scripts and Utilities

### Root Package Scripts
```bash
npm start              # Start API server
npm run dev            # Start API server with nodemon
npm run frontend       # Start frontend dev server
npm run frontend:build # Build frontend for production
npm run install:all    # Install all dependencies
npm run start:all      # Start both API and frontend
npm run dev:all        # Start both in development mode
npm run clean          # Clean up all lab containers
npm run status         # Check lab status
npm run list           # List available labs
```

### Utility Scripts (`scripts/`)
- `start-bugcamp.sh` - One-command startup script

## 🐳 Docker Integration

- **Lab containers** run in isolated environments
- **Shared network** (`labnet`) for inter-lab communication
- **Attacker server** can communicate with all labs
- **Automatic cleanup** with `make clean`

## 📊 Data Flow

1. **User Interface** → Frontend React application
2. **API Calls** → Express.js API server
3. **Make Commands** → Execute lab deployment/destruction
4. **Docker Management** → Container lifecycle management
5. **Status Updates** → Real-time lab status monitoring

## 🔒 Security Considerations

- **Isolated containers** for each lab
- **Network isolation** prevents lab-to-lab communication
- **Port binding** to localhost only
- **No persistent data** between lab sessions

## 🛠 Development Workflow

1. **Setup**: Run `npm run install:all`
2. **Development**: Run `npm run dev:all`
3. **Testing**: Deploy labs via frontend or `make <lab-name>`
4. **Cleanup**: Use `make clean` or frontend destroy buttons
5. **Building**: Run `npm run frontend:build` for production

## 📝 Configuration Files

- **`labs.json`**: Lab definitions and metadata
- **`Makefile`**: Lab management commands
- **`package.json`**: Dependencies and scripts
- **`.gitignore`**: Version control exclusions

## 🌐 Network Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │ API Server  │    │   Labs     │
│  (Port 5173)│◄──►│ (Port 3001) │◄──►│ (Port 8080)│
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                    ┌─────────────┐
                    │ Attacker    │
                    │ Server      │
                    │ (Port 8085) │
                    └─────────────┘
```

## 📚 Documentation

- **`README.md`**: Main project overview and quick start
- **`docs/PROJECT_STRUCTURE.md`**: This file - detailed structure
- **`frontend/README.md`**: Frontend-specific documentation
- **Inline code comments**: Implementation details

## 🔄 Maintenance

- **Regular updates** to vulnerability labs
- **Dependency updates** for security patches
- **Docker image updates** for base images
- **Documentation updates** for new features
