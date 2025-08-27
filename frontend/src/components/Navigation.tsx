import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';
import { useEffect } from 'react';
import type { Level } from '../types/lab';

interface NavigationProps {
  levels: Level[];
  currentLevel: string;
  onLevelChange: (levelName: string) => void;
}

export function Navigation({ levels, currentLevel, onLevelChange }: NavigationProps) {
  const currentIndex = levels.findIndex(level => level.name === currentLevel);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < levels.length - 1;

  const goToPrevious = () => {
    if (canGoPrevious) {
      onLevelChange(levels[currentIndex - 1].name);
    }
  };

  const goToNext = () => {
    if (canGoNext) {
      onLevelChange(levels[currentIndex + 1].name);
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with form inputs
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
        case 'Home':
          event.preventDefault();
          onLevelChange('all-labs');
          break;
        case 'End':
          event.preventDefault();
          onLevelChange(levels[levels.length - 1].name);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, levels, onLevelChange]);

  return (
    <motion.nav 
      className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between py-4">
          <div className="flex items-center space-x-1">
            {/* All Labs Tab */}
            <motion.button
              onClick={() => onLevelChange('all-labs')}
              className={`relative px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentLevel === 'all-labs'
                  ? 'text-green-500 bg-green-500/10 border border-green-500/30'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Show all labs from all levels"
            >
              <Grid3X3 className="h-4 w-4 mr-2 inline" />
              All Labs
              {currentLevel === 'all-labs' && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>

            {/* Level Tabs */}
            {levels.map((level) => (
              <motion.button
                key={level.name}
                onClick={() => onLevelChange(level.name)}
                className={`relative px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentLevel === level.name
                    ? 'text-green-500 bg-green-500/10 border border-green-500/30'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={`Go to ${level.name.replace('level-', 'Level ')}`}
              >
                {level.name.replace('level-', 'Level ')}
                {currentLevel === level.name && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"
                    layoutId="activeTab"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={goToPrevious}
              disabled={!canGoPrevious}
              className={`p-2 rounded-lg transition-colors ${
                canGoPrevious
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              whileHover={canGoPrevious ? { scale: 1.1 } : {}}
              whileTap={canGoPrevious ? { scale: 0.9 } : {}}
              title="Previous level (←)"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            
            <span className="text-sm text-gray-500 px-3">
              {currentLevel === 'all-labs' ? 'All Labs' : `${currentIndex + 1} of ${levels.length}`}
            </span>
            
            <motion.button
              onClick={goToNext}
              disabled={!canGoNext}
              className={`p-2 rounded-lg transition-colors ${
                canGoNext
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              whileHover={canGoNext ? { scale: 1.1 } : {}}
              whileTap={canGoNext ? { scale: 0.9 } : {}}
              title="Next level (→)"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-4">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={goToPrevious}
              disabled={!canGoPrevious}
              className={`p-2 rounded-lg transition-colors ${
                canGoPrevious
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              whileHover={canGoPrevious ? { scale: 1.1 } : {}}
              whileTap={canGoPrevious ? { scale: 0.9 } : {}}
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-green-500">
                {currentLevel === 'all-labs' ? 'All Labs' : currentLevel.replace('level-', 'Level ')}
              </h2>
              <p className="text-sm text-gray-400">
                {currentLevel === 'all-labs' ? 'All levels' : `${currentIndex + 1} of ${levels.length}`}
              </p>
            </div>
            
            <motion.button
              onClick={goToNext}
              disabled={!canGoNext}
              className={`p-2 rounded-lg transition-colors ${
                canGoNext
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              whileHover={canGoNext ? { scale: 1.1 } : {}}
              whileTap={canGoNext ? { scale: 0.9 } : {}}
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
          
          {/* Mobile Level Pills */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            {/* All Labs Pill */}
            <motion.button
              onClick={() => onLevelChange('all-labs')}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                currentLevel === 'all-labs'
                  ? 'bg-green-500 scale-125'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              title="Show all labs"
            />
            
            {/* Level Pills */}
            {levels.map((level) => (
              <motion.button
                key={level.name}
                onClick={() => onLevelChange(level.name)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  currentLevel === level.name
                    ? 'bg-green-500 scale-125'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                title={`Go to ${level.name.replace('level-', 'Level ')}`}
              />
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="hidden lg:block text-center py-2 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Keyboard shortcuts: ← → to navigate, Home for all labs, End for last level
          </p>
        </div>
      </div>
    </motion.nav>
  );
}
