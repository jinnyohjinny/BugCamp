import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bug, Github, ExternalLink, AlertTriangle } from 'lucide-react';
import { ProgressBar } from './components/ProgressBar';
import { LevelSection } from './components/LevelSection';
import type { Lab, Level } from './types/lab';
import { refreshLabsStatus, getAttackerServerStatus } from './lib/api';
import labsData from './labs.json';

function App() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attackerServerStatus, setAttackerServerStatus] = useState<'running' | 'stopped'>('stopped');

  useEffect(() => {
    const initializeLabs = async () => {
      try {
        // Transform the labs data to match our interface
        const transformedLevels: Level[] = labsData.levels.map(level => ({
          name: level.name,
          description: level.description,
          labs: level.labs.map(lab => ({
            id: lab.name,
            level: level.name,
            name: lab.name,
            description: lab.description,
            vulnerability: lab.vulnerability,
            port: lab.port,
            objective: lab.objective,
            category: lab.category,
            status: 'stopped' as const,
            hacked: false
          }))
        }));

        setLevels(transformedLevels);
        
        // Flatten all labs for easier management
        const allLabs = transformedLevels.flatMap(level => level.labs);
        
        // Load hacked status from localStorage
        const savedHackedStatus = localStorage.getItem('bugcamp-hacked-labs');
        if (savedHackedStatus) {
          const hackedLabs = JSON.parse(savedHackedStatus);
          allLabs.forEach(lab => {
            lab.hacked = hackedLabs.includes(lab.id);
          });
        }

        // Refresh lab statuses from API
        try {
          const updatedLabs = await refreshLabsStatus(allLabs);
          setLabs(updatedLabs);
          
          // Update levels with refreshed lab data
          const updatedLevels = transformedLevels.map(level => ({
            ...level,
            labs: level.labs.map(lab => 
              updatedLabs.find(updatedLab => updatedLab.id === lab.id) || lab
            )
          }));
          setLevels(updatedLevels);
        } catch (error) {
          console.warn('Failed to refresh lab statuses, using default:', error);
          setLabs(allLabs);
        }
        
        // Check attacker server status
        try {
          const status = await getAttackerServerStatus();
          setAttackerServerStatus(status);
        } catch (error) {
          console.warn('Failed to get attacker server status:', error);
          setAttackerServerStatus('stopped');
        }
      } catch (error) {
        console.error('Failed to initialize labs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLabs();
    
    // Set up periodic refresh of attacker server status
    const statusInterval = setInterval(async () => {
      try {
        const status = await getAttackerServerStatus();
        setAttackerServerStatus(status);
      } catch (error) {
        console.warn('Failed to refresh attacker server status:', error);
        setAttackerServerStatus('stopped');
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(statusInterval);
  }, []);

  const handleStatusChange = (labId: string, status: 'running' | 'stopped') => {
    setLabs(prevLabs => 
      prevLabs.map(lab => 
        lab.id === labId ? { ...lab, status } : lab
      )
    );
    
    setLevels(prevLevels =>
      prevLevels.map(level => ({
        ...level,
        labs: level.labs.map(lab =>
          lab.id === labId ? { ...lab, status } : lab
        )
      }))
    );
  };

  const handleHackedChange = (labId: string, hacked: boolean) => {
    setLabs(prevLabs => 
      prevLabs.map(lab => 
        lab.id === labId ? { ...lab, hacked } : lab
      )
    );
    
    setLevels(prevLevels =>
      prevLevels.map(level => ({
        ...level,
        labs: level.labs.map(lab =>
          lab.id === labId ? { ...lab, hacked } : lab
        )
      }))
    );

    // Save to localStorage
    const updatedLabs = labs.map(lab => 
      lab.id === labId ? { ...lab, hacked } : lab
    );
    const hackedLabIds = updatedLabs.filter(lab => lab.hacked).map(lab => lab.id);
    localStorage.setItem('bugcamp-hacked-labs', JSON.stringify(hackedLabIds));
  };

  const totalLabs = labs.length;
  const completedLabs = labs.filter(lab => lab.hacked).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Bug className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading BugCamp...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <motion.header 
        className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-2 bg-blue-600 rounded-lg">
                <Bug className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">BugCamp</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hands-on Vulnerability Training Platform
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="relative">
                <a
                  href={attackerServerStatus === 'running' ? "http://localhost:8085" : "#"}
                  target={attackerServerStatus === 'running' ? "_blank" : undefined}
                  rel={attackerServerStatus === 'running' ? "noopener noreferrer" : undefined}
                  onClick={attackerServerStatus === 'stopped' ? (e) => e.preventDefault() : undefined}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    attackerServerStatus === 'running'
                      ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 cursor-not-allowed'
                  }`}
                >
                  <ExternalLink className="h-4 w-4" />
                  Attacker Server
                  {attackerServerStatus === 'stopped' && (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </a>
                {attackerServerStatus === 'stopped' && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-600 text-white text-xs rounded-lg whitespace-nowrap z-10">
                    Attacker server is not online
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600"></div>
                  </div>
                )}
              </div>
              <a
                href="http://localhost:8085"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressBar completed={completedLabs} total={totalLabs} />
        
        <div className="space-y-12">
          {levels.map((level) => (
            <LevelSection
              key={level.name}
              levelName={level.name}
              levelDescription={level.description}
              labs={level.labs}
              onStatusChange={handleStatusChange}
              onHackedChange={handleHackedChange}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Built for security professionals and ethical hackers
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Remember: Only test on systems you own or have explicit permission to test
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default App;