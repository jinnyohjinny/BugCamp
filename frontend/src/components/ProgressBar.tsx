import { motion } from 'framer-motion';
import { Progress } from './ui/progress';

interface ProgressBarProps {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-green-500">
          Progress
        </h2>
        <span className="text-sm text-gray-400">
          {completed} / {total} labs hacked
        </span>
      </div>
      <Progress 
        value={percentage} 
        className="h-3"
      />
      <motion.div 
        className="text-center mt-2"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-2xl font-bold text-green-500">
          {Math.round(percentage)}%
        </span>
      </motion.div>
    </motion.div>
  );
}
