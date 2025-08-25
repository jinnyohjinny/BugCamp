# BugCamp Development Guide

This guide is for developers who want to contribute to or extend the BugCamp platform.

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and npm
- **Docker** and Docker Compose
- **Make** utility
- **jq** for JSON parsing

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/jinnyohjinny/BugCamp.git
cd BugCamp

# Install all dependencies
npm run install:all

# Start development environment
npm run dev:all
```

## 🏗 Project Architecture

### Frontend Architecture
```
frontend/src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── ProgressBar.tsx # Progress tracking component
│   ├── LabCard.tsx     # Individual lab display
│   └── LevelSection.tsx # Lab grouping by level
├── lib/                 # Utility functions and API
├── types/               # TypeScript type definitions
└── App.tsx             # Main application component
```

### API Server Architecture
```
api-server.js            # Main Express server
├── /api/make           # Execute Makefile commands
├── /api/status         # Check lab container status
└── /health             # Health check endpoint
```

### Lab Management
```
Makefile                # Lab deployment commands
labs.json               # Lab configuration
labs/                   # Individual lab containers
└── level-01/          # Level-based organization
    ├── jwt-1/         # Individual lab
    ├── sqli-1/        # Individual lab
    └── cve-2014-6271/ # Individual lab
```

## 🛠 Development Workflow

### 1. Frontend Development
```bash
cd frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run lint             # Run linting
```

### 2. API Server Development
```bash
npm run dev              # Start with nodemon (auto-restart)
npm start                # Start production server
```

### 3. Lab Development
```bash
# Test lab deployment
make <lab-name>

# Check lab status
make status

# Clean up labs
make clean
```

## 📝 Adding New Labs

### 1. Create Lab Directory
```bash
mkdir -p labs/level-02/new-lab
cd labs/level-02/new-lab
```

### 2. Create Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  new-lab:
    build: .
    ports:
      - "8080:8080"
    networks:
      - labnet

networks:
  labnet:
    external: true
```

### 3. Update Configuration
Add to `labs.json`:
```json
{
  "name": "new-lab",
  "vulnerability": "Description",
  "description": "Lab description",
  "port": 8080,
  "objective": "Learning objective",
  "category": "Vulnerability Type"
}
```

### 4. Test Lab
```bash
make new-lab
make status
make clean
```

## 🔧 API Development

### Adding New Endpoints
```javascript
// In api-server.js
app.get('/api/new-endpoint', (req, res) => {
  // Implementation
  res.json({ message: 'Success' });
});
```

### Error Handling
```javascript
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: error.message 
  });
});
```

## 🎨 Frontend Development

### Component Structure
```typescript
// Example component structure
interface ComponentProps {
  // Props interface
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```

### State Management
- Use React hooks for local state
- Props for component communication
- Context API for global state if needed

### Styling
- Tailwind CSS for utility classes
- shadcn/ui for component styling
- Custom CSS for specific needs

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test                 # Run test suite
npm run test:coverage   # Coverage report
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test lab deployment
curl -X POST http://localhost:3001/api/make \
  -H "Content-Type: application/json" \
  -d '{"command":"deploy","labId":"jwt-1"}'
```

### Lab Testing
```bash
# Deploy lab
make jwt-1

# Check if running
docker ps | grep jwt-1

# Test lab functionality
curl http://localhost:8080

# Clean up
make clean
```

## 📊 Debugging

### Frontend Debugging
- Browser DevTools
- React Developer Tools
- Console logging
- Network tab for API calls

### API Server Debugging
- Console logging in api-server.js
- Docker logs: `docker logs <container-name>`
- Network inspection: `docker network inspect labnet`

### Lab Debugging
- Container logs: `docker logs <lab-container>`
- Container inspection: `docker exec -it <container> sh`
- Network debugging: `docker network inspect labnet`

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run frontend:build

# Start production server
npm start
```

### Docker Deployment
```bash
# Build and run with Docker
docker build -t bugcamp .
docker run -p 3001:3001 bugcamp
```

## 📚 Code Standards

### TypeScript
- Use strict mode
- Define interfaces for all props
- Avoid `any` type
- Use proper error handling

### React
- Functional components with hooks
- Proper prop validation
- Error boundaries for error handling
- Memoization for performance

### Node.js
- Async/await for promises
- Proper error handling
- Input validation
- Security best practices

## 🔒 Security Considerations

### Frontend Security
- Sanitize user inputs
- Validate API responses
- Use HTTPS in production
- Implement proper CORS

### API Security
- Input validation
- Rate limiting
- Authentication (if needed)
- Secure headers

### Lab Security
- Container isolation
- Network isolation
- Resource limits
- No persistent data

## 🤝 Contributing

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Update documentation
6. Submit PR

### Code Review
- All PRs require review
- Ensure tests pass
- Check for security issues
- Verify documentation updates

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: Check docs/ directory
- **Code**: Review existing implementations

## 🔄 Maintenance

### Regular Tasks
- Update dependencies
- Security patches
- Docker base image updates
- Documentation updates

### Monitoring
- API server health
- Lab container status
- Frontend performance
- Error logging
