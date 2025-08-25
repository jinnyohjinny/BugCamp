const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to check if any lab is currently running
function checkRunningLabs(callback) {
  const dockerCommand = `docker ps --format "{{.Names}}" | grep -E ".*-lab$"`;
  
  exec(dockerCommand, (error, stdout, stderr) => {
    if (error) {
      // No labs running
      callback(null, []);
    } else {
      // Get running lab names
      const runningLabs = stdout.trim().split('\n').filter(name => name.length > 0);
      callback(null, runningLabs);
    }
  });
}

// Helper function to execute make commands
function executeMakeCommand(command, labId, res) {
  const projectRoot = path.join(__dirname);
  
  let makeCommand;
  if (command === 'deploy') {
    // Check if any lab is already running before deploying
    checkRunningLabs((error, runningLabs) => {
      if (error) {
        return res.status(500).json({ error: 'Failed to check running labs' });
      }
      
      if (runningLabs.length > 0) {
        const runningLabName = runningLabs[0].replace('-lab', '');
        return res.status(409).json({ 
          error: `Cannot deploy lab. Lab "${runningLabName}" is already running. Please destroy it first.`,
          runningLab: runningLabName
        });
      }
      
      // No labs running, proceed with deployment
      makeCommand = `cd "${projectRoot}" && make ${labId}`;
      executeMakeCommandInternal(makeCommand, res);
    });
    return; // Exit early, will be handled in callback
  } else if (command === 'clean') {
    makeCommand = `cd "${projectRoot}" && make clean`;
  } else {
    return res.status(400).json({ error: 'Invalid command' });
  }
  
  executeMakeCommandInternal(makeCommand, res);
}

// Internal function to execute the actual make command
function executeMakeCommandInternal(makeCommand, res) {
  const projectRoot = path.join(__dirname);
  
  console.log(`Executing: ${makeCommand}`);

  // Add timeout to prevent hanging requests (10 minutes for Docker builds)
  const execOptions = { 
    cwd: projectRoot, 
    timeout: 1200000 // 20 minutes timeout
  };

  exec(makeCommand, execOptions, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing make command: ${error.message}`);
      
      // Check if it's a timeout error
      if (error.code === 'ETIMEDOUT') {
        return res.status(408).json({ 
          error: 'Command execution timed out. Docker builds can take several minutes.',
          details: 'The lab deployment is still running in the background. Check Docker status with "make status"',
          code: 'TIMEOUT'
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to execute make command',
        details: error.message,
        stderr: stderr
      });
    }

    if (stderr) {
      console.warn(`Make command stderr: ${stderr}`);
    }

    console.log(`Make command output: ${stdout}`);
    
    res.json({ 
      success: true, 
      message: `Make command executed successfully`,
      output: stdout,
      stderr: stderr
    });
  });
}

// API endpoints
app.post('/api/make', (req, res) => {
  const { command, labId } = req.body;
  
  if (!command || !labId) {
    return res.status(400).json({ error: 'Missing command or labId' });
  }

  executeMakeCommand(command, labId, res);
});

app.get('/api/status', (req, res) => {
  const { lab } = req.query;
  
  if (!lab) {
    return res.status(400).json({ error: 'Missing lab parameter' });
  }

  // Check if the lab container is running
  const dockerCommand = `docker ps --format "{{.Names}}" | grep -q "${lab}-lab"`;
  
  exec(dockerCommand, (error, stdout, stderr) => {
    if (error) {
      // Container not running
      return res.json({ status: 'stopped' });
    }
    
    // Container is running
    return res.json({ status: 'running' });
  });
});

app.get('/api/attacker-status', (req, res) => {
  // Check if the attacker-server container is running
  const dockerCommand = `docker ps --format "{{.Names}}" | grep -q "attacker-server"`;
  
  exec(dockerCommand, (error, stdout, stderr) => {
    if (error) {
      // Container not running
      return res.json({ status: 'stopped' });
    }
    
    // Container is running
    return res.json({ status: 'running' });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`BugCamp API Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /api/make - Execute make commands');
  console.log('  GET  /api/status - Check lab status');
  console.log('  GET  /api/attacker-status - Check attacker server status');
  console.log('  GET  /health - Health check');
});
