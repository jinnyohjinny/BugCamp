import { motion } from 'framer-motion';
import { Play, Square, CheckCircle, ExternalLink, Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { Level } from '../types/lab';

interface LevelViewProps {
  level: Level;
  onStatusChange: (labId: string, status: 'running' | 'stopped') => void;
  onHackedChange: (labId: string, hacked: boolean) => void;
  labOperationInProgress: Set<string>;
  labErrors: Map<string, string>;
  labSuccess: Map<string, string>;
}

export function LevelView({ level, onStatusChange, onHackedChange, labOperationInProgress, labErrors, labSuccess }: LevelViewProps) {
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

      {/* Global Operation Status */}
      {labOperationInProgress.size > 0 && (
        <motion.div 
          className="w-full max-w-2xl mx-auto p-4 bg-blue-900/50 border border-blue-700 rounded-lg text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
            <span className="text-blue-300 font-medium">
              {labOperationInProgress.size === 1 
                ? 'Lab operation in progress... Please wait until it completes.'
                : `${labOperationInProgress.size} lab operations in progress... Please wait until they complete.`
              }
            </span>
          </div>
        </motion.div>
      )}

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
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
                  {lab.name}
                </h3>
                <p className="text-sm text-gray-400 mb-3 leading-relaxed">
                  {lab.vulnerability}
                </p>
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lab.hacked 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-700 text-gray-300 border border-gray-600'
                  }`}>
                    {lab.hacked ? 'Completed' : lab.category}
                  </span>
                  {lab.hacked && (
                    <div className="flex items-center space-x-2 text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Status Indicator */}
              <div className="flex flex-col items-end space-y-2 ml-3">
                <div className={`w-3 h-3 rounded-full ${
                  lab.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  Port {lab.port}
                </span>
              </div>
            </div>

            {/* Lab Description */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Description:</h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {lab.description}
              </p>
            </div>

            {/* Objective */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Objective:</h4>
              <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-lg leading-relaxed">
                {lab.objective}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 mb-3">
              <motion.button
                onClick={() => onStatusChange(lab.id, lab.status === 'running' ? 'stopped' : 'running')}
                disabled={labOperationInProgress.has(lab.id) || labOperationInProgress.size > 0}
                title={
                  labOperationInProgress.has(lab.id)
                    ? (lab.status === 'running' ? 'Stopping lab...' : 'Starting lab...')
                    : labOperationInProgress.size > 0
                    ? 'Another lab operation is in progress. Please wait.'
                    : lab.status === 'running'
                    ? 'Click to stop the lab'
                    : 'Click to start the lab'
                }
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  lab.status === 'running'
                    ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-800 disabled:cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-800 disabled:cursor-not-allowed'
                }`}
                whileHover={(labOperationInProgress.has(lab.id) || labOperationInProgress.size > 0) ? {} : { scale: 1.02 }}
                whileTap={(labOperationInProgress.has(lab.id) || labOperationInProgress.size > 0) ? {} : { scale: 0.98 }}
              >
                {labOperationInProgress.has(lab.id) ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{lab.status === 'running' ? 'Stopping...' : 'Starting...'}</span>
                  </>
                ) : labOperationInProgress.size > 0 ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    <span>Please wait...</span>
                  </>
                ) : lab.status === 'running' ? (
                  <>
                    <Square className="h-4 w-4" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Start</span>
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

            {/* Success Display */}
            {labSuccess.has(lab.id) && (
              <motion.div
                className="mt-3 p-3 bg-green-900/50 border border-green-700 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm text-green-300">
                  <span className="font-medium">Success:</span> {labSuccess.get(lab.id)}
                </p>
              </motion.div>
            )}

            {/* Error Display */}
            {labErrors.has(lab.id) && (
              <motion.div
                className="mt-3 p-3 bg-red-900/50 border border-red-700 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm text-red-300">
                  <span className="font-medium">Error:</span> {labErrors.get(lab.id)}
                </p>
              </motion.div>
            )}

            {/* Access Link */}
            {lab.status === 'running' && (
              <motion.a
                href={`http://localhost:${lab.port}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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
