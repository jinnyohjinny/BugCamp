# BugCamp - Vulnerability Training Platform

BugCamp is a comprehensive platform for hands-on vulnerability training and ethical hacking practice. It provides a collection of vulnerable applications and labs that security professionals can use to learn and practice various attack techniques in a safe, controlled environment.

## Requirements

- Docker
- Node.js (for API server)
- jq (for JSON parsing in Makefile)
- Make

## How to Run

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

## Run Labs Without UI Using Make

You can run labs directly from the command line using the Makefile:

```bash
# List all available levels
make list

# List labs within a specific level
make level-01

# Run a specific lab
make jwt-1
make sqli-1
make cve-2014-6271
make pickle
make cve-2016-10033
make jwt-2

# Check status of running containers
make status

# Clean up all containers
make clean

# Show help
make help
```

### Available Labs

**Level 00: Fundamental**
- `xss-1` - Cross-Site Scripting (XSS) vulnerability

**Level 01: Basic**
- `cve-2014-6271` - Shellshock vulnerability
- `jwt-1` - JWT Algorithm Confusion
- `sqli-1` - SQL Injection
- `pickle` - Python Pickle Deserialization

**Level 02: Intermediate**
- `cve-2016-10033` - PHPMailer Command Injection
- `jwt-2` - Advanced JWT Algorithm Confusion

## TODO List

- [ ] Add more advanced vulnerability labs
- [ ] Implement lab difficulty progression system
- [ ] Add a mystery lab feature
- [ ] Add an automatic checking system if you successfully hack the lab
- [ ] Add blogs related to hacking and lab-replicated vulnerabilities

## ⚠️ Security Notice

**IMPORTANT**: These labs contain intentionally vulnerable applications. Only run them in isolated environments. Never deploy these applications in production or on public networks.

