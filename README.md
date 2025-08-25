# BugCamp - Vulnerability Training Platform

BugCamp is a comprehensive platform for hands-on vulnerability training and ethical hacking practice. It provides a collection of vulnerable applications and labs that security professionals can use to learn and practice various attack techniques in a safe, controlled environment.

## 🚀 Quick Start

### Option 1: One-Command Startup (Recommended)
```bash
./scripts/start-bugcamp.sh
```

This will start both the API server and React frontend automatically.

### Option 2: Manual Startup

1. **Start the API Server:**
   ```bash
   npm install express cors
   node api-server.js
   ```

2. **Start the React Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access the platform:**
   - Frontend: http://localhost:5173
   - API Server: http://localhost:3001

## 🏗 Architecture

### Frontend (React + TypeScript)
- **Location**: `frontend/` directory
- **Tech Stack**: React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Features**: 
  - Modern, responsive UI
  - Real-time lab status monitoring
  - Progress tracking with localStorage persistence
  - Smooth animations and transitions

### API Server (Node.js + Express)
- **Location**: `api-server.js`
- **Purpose**: Executes Makefile commands and manages lab status
- **Endpoints**:
  - `POST /api/make` - Execute make commands (deploy/destroy labs)
  - `GET /api/status` - Check lab container status
  - `GET /api/attacker-status` - Check attacker server status
  - `GET /health` - Health check

### Lab Management (Makefile + Docker)
- **Location**: `Makefile` and `labs/` directory
- **Features**:
  - Automated lab deployment and cleanup
  - **Single lab enforcement**: Only one lab can run at a time
  - Docker container management
  - Network isolation with `labnet`
  - Attacker server integration

## 🧪 Available Labs

### Level 01: Basic Vulnerabilities
- **JWT-1**: JWT Algorithm Confusion vulnerability (Port 8080)
- **SQLi-1**: SQL Injection in news portal (Port 8080)
- **CVE-2014-6271**: Shellshock vulnerability (Port 8080)

Each lab includes:
- Vulnerable application
- Docker containerization
- Clear learning objectives
- Integration with attacker server

## 🎯 How It Works

1. **Deploy a Lab**: Click "Deploy" button → Executes `make <lab-name>` → Starts Docker containers
   - **Note**: Only one lab can run at a time. Deploying a new lab will automatically stop any previously running lab.
2. **Access the Lab**: Lab becomes accessible on port 8080
3. **Practice Attacks**: Use the attacker server at http://localhost:8085 for tools
4. **Mark as Complete**: Check "Hacked" checkbox when you've successfully exploited the vulnerability
5. **Clean Up**: Click "Destroy" button → Executes `make clean` → Stops all containers

## 📚 Learning Resources

- Each lab includes detailed objectives and descriptions
- Attacker server provides tools and payloads
- Progress tracking helps monitor learning journey
- Labs are categorized by vulnerability type

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your lab or improvement
4. Test thoroughly
5. Submit a pull request

## ⚠️ Security Notice

**IMPORTANT**: These labs contain intentionally vulnerable applications. Only run them in isolated environments. Never deploy these applications in production or on public networks.


**Happy Hacking! 🎭🔒**

