# BugCamp Quick Reference

Quick commands and references for daily BugCamp usage.

## 🚀 Quick Start Commands

### One-Command Startup
```bash
./scripts/start-bugcamp.sh
```

### Manual Startup
```bash
# Terminal 1: API Server
npm start

# Terminal 2: Frontend
npm run frontend
```

### Install Dependencies
```bash
npm run install:all
```

## 📱 Frontend Commands

```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linting
npm run preview      # Preview production build
```

## 🔧 API Server Commands

```bash
npm start            # Start production server
npm run dev          # Start with nodemon
npm run front:all    # Start both services
```

## 🐳 Lab Management Commands

### Via Makefile
```bash
make list            # List all levels
make level-01        # List labs in level-01
make jwt-1           # Deploy JWT lab
make sqli-1          # Deploy SQL injection lab
make cve-2014-6271   # Deploy Shellshock lab
make status          # Check running containers
make clean           # Stop all labs
make help            # Show help
```

### Via Frontend
- **Deploy**: Click blue "Deploy" button → Executes `make <lab-name>`
- **Destroy**: Click red "Destroy" button → Executes `make clean`
- **Status**: Real-time updates via API server

## 🌐 Service URLs

| Service | URL | Port | Description |
|---------|-----|------|-------------|
| Frontend | http://localhost:5173 | 5173 | React application |
| API Server | http://localhost:3001 | 3001 | Backend API |
| Labs | http://localhost:8080 | 8080 | Deployed labs |
| Attacker Server | http://localhost:8085 | 8085 | Attack tools |

## 🔍 Status Checking

### Check API Health
```bash
curl http://localhost:3001/health
```

### Check Lab Status
```bash
curl "http://localhost:3001/api/status?lab=jwt-1"
```

### Check Docker Containers
```bash
docker ps                    # Running containers
docker ps -a                 # All containers
docker network ls            # Networks
docker network inspect labnet # Lab network details
```

## 🧹 Cleanup Commands

### Stop All Labs
```bash
make clean
```

### Remove All Containers
```bash
docker stop $(docker ps -q)
docker rm $(docker ps -aq)
```

### Remove Lab Network
```bash
docker network rm labnet
```

### Clean Docker System
```bash
docker system prune -a
```

## 📊 Lab Information

### Available Labs
- **JWT-1**: JWT Algorithm Confusion (Port 8080)
- **SQLi-1**: SQL Injection (Port 8080)
- **CVE-2014-6271**: Shellshock (Port 8080)

### Lab Categories
- **Authentication Bypass**: JWT manipulation
- **SQL Injection**: Database vulnerabilities
- **Command Injection**: Shell command execution

## 🛠 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :8080
# Kill process
kill -9 <PID>
```

#### Docker Issues
```bash
# Restart Docker
sudo systemctl restart docker

# Check Docker status
sudo systemctl status docker
```

#### API Server Not Responding
```bash
# Check if running
ps aux | grep api-server

# Restart server
npm start
```

#### Frontend Build Issues
```bash
# Clear node_modules
rm -rf frontend/node_modules
npm run frontend:install
```

### Debug Commands

#### Check Logs
```bash
# API server logs
tail -f api-server.log

# Docker container logs
docker logs <container-name>

# Frontend build logs
cd frontend && npm run build
```

#### Network Debugging
```bash
# Check labnet network
docker network inspect labnet

# Test lab connectivity
curl -v http://localhost:8080
```

## 📝 Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| `labs.json` | Lab definitions | Root directory |
| `Makefile` | Lab management | Root directory |
| `package.json` | Dependencies | Root directory |
| `api-server.js` | API server | Root directory |
| `frontend/` | React app | Frontend directory |

## 🔒 Security Notes

- **Labs are intentionally vulnerable** - Only run in isolated environments
- **Ports bound to localhost** - No external access by default
- **Container isolation** - Labs cannot communicate with host system
- **No persistent data** - All changes reset on lab restart

## 📚 Additional Resources

- **Main README**: `README.md`
- **Project Structure**: `docs/PROJECT_STRUCTURE.md`
- **Development Guide**: `docs/DEVELOPMENT.md`
- **Frontend README**: `frontend/README.md`

## 🆘 Getting Help

1. **Check logs** for error messages
2. **Verify services** are running
3. **Check documentation** in `docs/` directory
4. **Review GitHub issues** for known problems
5. **Create new issue** if problem persists

---

**Remember**: When in doubt, `make clean` and start fresh! 🧹✨
