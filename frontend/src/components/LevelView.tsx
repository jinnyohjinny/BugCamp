import { motion } from 'framer-motion';
import { Play, Square, CheckCircle, ExternalLink, Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { Level } from '../types/lab';

interface LevelViewProps {
  level: Level;
  onStatusChange: (labId: string, status: 'running' | 'stopped') => void;
  onHackedChange: (labId: string, hacked: boolean) => void;
}

export function LevelView({ level, onStatusChange, onHackedChange }: LevelViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Get unique categories for filtering
  const categories = useMemo(() => {
    const cats = [...new Set(level.labs.map(lab => lab.category))];
    return ['all', ...cats];
  }, [level.labs]);

  // Filter labs based on search and category
  const filteredLabs = useMemo(() => {
    return level.labs.filter(lab => {
      const matchesSearch = lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lab.vulnerability.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lab.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || lab.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [level.labs, searchTerm, filterCategory]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Level Header */}
      <motion.div 
        className="text-center space-y-4"
        variants={itemVariants}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-green-500">
          {level.name.replace('level-', 'Level ')}
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          {level.description}
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
          <span>{level.labs.length} labs</span>
          <span>•</span>
          <span>{level.labs.filter(lab => lab.hacked).length} completed</span>
        </div>
      </motion.div>

      {/* Search and Filter Controls */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 items-center justify-center"
        variants={itemVariants}
      >
        {/* Search Input */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search labs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Results Count */}
      {searchTerm || filterCategory !== 'all' ? (
        <motion.div 
          className="text-center text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Showing {filteredLabs.length} of {level.labs.length} labs
        </motion.div>
      ) : null}

      {/* Labs Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={itemVariants}
      >
        {filteredLabs.map((lab) => (
          <motion.div
            key={lab.id}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10"
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Lab Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {lab.name}
                </h3>
                <p className="text-sm text-gray-400 mb-2">
                  {lab.vulnerability}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lab.hacked 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-700 text-gray-300 border border-gray-600'
                  }`}>
                    {lab.hacked ? 'Completed' : lab.category}
                  </span>
                  {lab.hacked && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
              
              {/* Status Indicator */}
              <div className="flex flex-col items-end space-y-2">
                <div className={`w-3 h-3 rounded-full ${
                  lab.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className="text-xs text-gray-400">
                  Port {lab.port}
                </span>
              </div>
            </div>

            {/* Lab Description */}
            <p className="text-gray-300 text-sm mb-4 line-clamp-3">
              {lab.description}
            </p>

            {/* Objective */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Objective:</h4>
              <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-lg">
                {lab.objective}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={() => onStatusChange(lab.id, lab.status === 'running' ? 'stopped' : 'running')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  lab.status === 'running'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {lab.status === 'running' ? (
                  <>
                    <Square className="h-4 w-4" />
                    <span className="hidden sm:inline">Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span className="hidden sm:inline">Start</span>
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={() => onHackedChange(lab.id, !lab.hacked)}
                className={`p-2 rounded-lg transition-colors ${
                  lab.hacked
                    ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={lab.hacked ? 'Mark as incomplete' : 'Mark as completed'}
              >
                <CheckCircle className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Access Link */}
            {lab.status === 'running' && (
              <motion.a
                href={`http://localhost:${lab.port}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center space-x-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ExternalLink className="h-4 w-4" />
                <span>Access Lab</span>
              </motion.a>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* No Results Message */}
      {filteredLabs.length === 0 && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-gray-400 text-lg">No labs found matching your criteria.</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter options.</p>
        </motion.div>
      )}

      {/* Level Progress */}
      <motion.div 
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center"
        variants={itemVariants}
      >
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="text-2xl font-bold text-green-500">
            {level.labs.filter(lab => lab.hacked).length}
          </div>
          <div className="text-gray-400">of</div>
          <div className="text-2xl font-bold text-gray-300">
            {level.labs.length}
          </div>
          <div className="text-gray-400">labs completed</div>
        </div>
        
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: `${(level.labs.filter(lab => lab.hacked).length / level.labs.length) * 100}%` 
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
