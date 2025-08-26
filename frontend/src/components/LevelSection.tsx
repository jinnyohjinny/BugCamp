import { motion } from 'framer-motion';
import { LabCard } from './LabCard';
import type { Lab } from '../types/lab';

interface LevelSectionProps {
  levelName: string;
  levelDescription: string;
  labs: Lab[];
  onStatusChange: (labId: string, status: 'running' | 'stopped') => void;
  onHackedChange: (labId: string, hacked: boolean) => void;
}

export function LevelSection({ 
  levelName, 
  levelDescription, 
  labs, 
  onStatusChange, 
  onHackedChange 
}: LevelSectionProps) {
  const completedLabs = labs.filter(lab => lab.hacked).length;

  return (
    <motion.section 
      className="mb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-green-500 mb-2 capitalize">
            {levelName.replace('-', ' ')}
          </h2>
          <p className="text-gray-400 mb-2">{levelDescription}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">
              {labs.length} labs available
            </span>
            <span className="text-green-400 font-medium">
              {completedLabs} completed
            </span>
            <div className={`px-2 py-1 rounded-full text-xs ${
              completedLabs === labs.length && labs.length > 0
                ? 'bg-green-900 text-green-100'
                : 'bg-gray-800 text-gray-300'
            }`}>
              {completedLabs === labs.length && labs.length > 0 ? 'All Complete!' : 'In Progress'}
            </div>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {labs.map((lab, index) => (
          <motion.div
            key={lab.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <LabCard
              lab={lab}
              onStatusChange={onStatusChange}
              onHackedChange={onHackedChange}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
