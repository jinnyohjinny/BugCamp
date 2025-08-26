import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Loader2, Shield, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import type { Lab } from '../types/lab';
import { deployLab, destroyLab } from '../lib/api';

interface LabCardProps {
  lab: Lab;
  onStatusChange: (labId: string, status: 'running' | 'stopped') => void;
  onHackedChange: (labId: string, hacked: boolean) => void;
}

export function LabCard({ lab, onStatusChange, onHackedChange }: LabCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await deployLab(lab.id);
      // Update status to running immediately for better UX
      onStatusChange(lab.id, 'running');
      
      // Refresh status after a short delay to ensure it's accurate
      setTimeout(() => {
        onStatusChange(lab.id, 'running');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deploy lab');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDestroy = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await destroyLab(lab.id);
      // Update status to stopped immediately for better UX
      onStatusChange(lab.id, 'stopped');
      
      // Refresh status after a short delay to ensure it's accurate
      setTimeout(() => {
        onStatusChange(lab.id, 'stopped');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to destroy lab');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHackedChange = (checked: boolean) => {
    onHackedChange(lab.id, checked);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                {lab.name}
              </CardTitle>
              <CardDescription className="text-sm mb-2">
                {lab.description}
              </CardDescription>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              lab.status === 'running' 
                ? 'bg-green-900 text-green-100'
                : 'bg-gray-800 text-gray-300'
            }`}>
              {lab.status === 'running' ? 'Running' : 'Stopped'}
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">Vulnerability:</span>
              <span className="font-medium text-gray-200">{lab.vulnerability}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Category:</span>
              <span className="px-2 py-1 bg-gray-800 text-gray-200 rounded text-xs">
                {lab.category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Port:</span>
              <span className="font-mono text-sm">{lab.port}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
                          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-sm font-medium mb-1">Objective:</p>
                          <p className="text-sm text-gray-400">{lab.objective}</p>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800"
            >
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-4">
          <div className="flex items-center space-x-2 w-full">
            <Checkbox 
              id={`hacked-${lab.id}`}
              checked={lab.hacked}
              onCheckedChange={handleHackedChange}
            />
            <label 
              htmlFor={`hacked-${lab.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Hacked ✓
            </label>
          </div>
          
          <Button
            onClick={lab.status === 'running' ? handleDestroy : handleDeploy}
            disabled={isLoading}
            variant={lab.status === 'running' ? 'destructive' : 'default'}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : lab.status === 'running' ? (
              <Square className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isLoading 
              ? (lab.status === 'running' ? 'Destroying...' : 'Deploying...') 
              : (lab.status === 'running' ? 'Destroy' : 'Deploy')
            }
          </Button>
          
          {lab.status === 'running' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full text-center"
            >
              <a 
                href={`http://localhost:${lab.port}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Open Lab ↗
              </a>
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
