import { motion } from 'framer-motion';
import { Play, Square, CheckCircle, ExternalLink, Search, Filter, Grid3X3, Layers } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { Level } from '../types/lab';

interface AllLabsViewProps {
  levels: Level[];
  onStatusChange: (labId: string, status: 'running' | 'stopped') => void;
  onHackedChange: (labId: string, hacked: boolean) => void;
  labOperationInProgress: Set<string>;
  labErrors: Map<string, string>;
  labSuccess: Map<string, string>;
}

export function AllLabsView({ levels, onStatusChange, onHackedChange, labOperationInProgress, labErrors, labSuccess }: AllLabsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  // Get all labs from all levels
  const allLabs = useMemo(() => {
    return levels.flatMap(level => 
      level.labs.map(lab => ({
        ...lab,
        levelName: level.name,
        levelDescription: level.description
      }))
    );
  }, [levels]);

  // Get unique categories and levels for filtering
  const categories = useMemo(() => {
    const cats = [...new Set(allLabs.map(lab => lab.category))];
    return ['all', ...cats];
  }, [allLabs]);

  const levelOptions = useMemo(() => {
    const levelOpts = levels.map(level => ({
      value: level.name,
      label: level.name.replace('level-', 'Level '),
      description: level.description
    }));
    return [{ value: 'all', label: 'All Levels', description: 'Show labs from all levels' }, ...levelOpts];
  }, [levels]);

  // Filter labs based on search, category, and level
  const filteredLabs = useMemo(() => {
    return allLabs.filter(lab => {
      const matchesSearch = lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lab.vulnerability.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lab.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lab.objective.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || lab.category === filterCategory;
      const matchesLevel = filterLevel === 'all' || lab.levelName === filterLevel;
      
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [allLabs, searchTerm, filterCategory, filterLevel]);

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

  const totalLabs = allLabs.length;
  const completedLabs = allLabs.filter(lab => lab.hacked).length;
  const runningLabs = allLabs.filter(lab => lab.status === 'running').length;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="text-center space-y-4"
        variants={itemVariants}
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-green-500 rounded-lg">
            <Grid3X3 className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-green-500">
            All Labs
          </h1>
        </div>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Comprehensive view of all vulnerability labs across all levels
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
          <span className="flex items-center space-x-2">
            <Layers className="h-4 w-4" />
            <span>{levels.length} levels</span>
          </span>
          <span>•</span>
          <span>{totalLabs} total labs</span>
          <span>•</span>
          <span className="text-green-400">{completedLabs} completed</span>
          <span>•</span>
          <span className="text-blue-400">{runningLabs} running</span>
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
        className="flex flex-col lg:flex-row gap-4 items-center justify-center"
        variants={itemVariants}
      >
        {/* Search Input */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search all labs..."
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

        {/* Level Filter */}
        <div className="relative">
          <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
          >
            {levelOptions.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Results Count */}
      {(searchTerm || filterCategory !== 'all' || filterLevel !== 'all') ? (
        <motion.div 
          className="text-center text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Showing {filteredLabs.length} of {totalLabs} labs
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
                <div className="flex items-center space-x-2 mb-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 whitespace-nowrap">
                    {lab.levelName.replace('level-', 'Level ')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lab.hacked 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-700 text-gray-300 border border-gray-600'
                  }`}>
                    {lab.hacked ? 'Completed' : lab.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
                  {lab.name}
                </h3>
                <p className="text-sm text-gray-400 mb-3 leading-relaxed">
                  {lab.vulnerability}
                </p>
                {lab.hacked && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                )}
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

      {/* Overall Progress */}
      <motion.div 
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center"
        variants={itemVariants}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500">{levels.length}</div>
            <div className="text-gray-400">Levels</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-300">{totalLabs}</div>
            <div className="text-gray-400">Total Labs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">{completedLabs}</div>
            <div className="text-gray-400">Completed</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: `${(completedLabs / totalLabs) * 100}%` 
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        
        <div className="mt-4 text-center">
          <span className="text-2xl font-bold text-green-500">
            {Math.round((completedLabs / totalLabs) * 100)}%
          </span>
          <span className="text-gray-400 ml-2">overall completion</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
