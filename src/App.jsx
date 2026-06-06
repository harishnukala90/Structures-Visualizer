import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, RotateCcw, 
  Cpu, Code, Activity, Hash, Network, ListCollapse, Sliders,
  Plus, Trash2, Search, RefreshCw, Layers, Globe
} from 'lucide-react';
import { DATA_STRUCTURES, CATEGORIES } from './dataStructures';
import Visualizer from './components/Visualizer';
import { generateSteps } from './animationEngine';
import { useTranslation } from 'react-i18next';

export default function App() {
  const { t, i18n } = useTranslation();
  // Navigation & Selection States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeStructure, setActiveStructure] = useState(DATA_STRUCTURES[0]); // default: Integer
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isComplexityOpen, setIsComplexityOpen] = useState(false);
  const complexityRef = useRef(null);
  const visualizerRef = useRef(null);
  
  // Data State representing the current visual frame
  const [structureState, setStructureState] = useState(activeStructure.defaultState);

  // Animation timeline states
  const [timeline, setTimeline] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000); // ms
  
  // Input fields for operations
  const [inputValue, setInputValue] = useState('');
  const [inputIndex, setInputIndex] = useState('');
  const [inputRow, setInputRow] = useState('');
  const [inputCol, setInputCol] = useState('');
  const [graphMode, setGraphMode] = useState('BFS');
  const [treeInputType, setTreeInputType] = useState('num');
  const [treeTraversalMode, setTreeTraversalMode] = useState('inorder');
  const [pointerTargetType, setPointerTargetType] = useState('int');

  // Code Viewer State
  const [activeLang, setActiveLang] = useState('cpp');

  // Timer Ref for play/pause interval
  const timerRef = useRef(null);

  // Close complexity dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (complexityRef.current && !complexityRef.current.contains(e.target)) {
        setIsComplexityOpen(false);
      }
    };
    if (isComplexityOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isComplexityOpen]);

  const handleStructureSelect = (ds) => {
    setActiveStructure(ds);
    setStructureState(ds.defaultState);
    setTimeline([]);
    setCurrentStepIdx(-1);
    setIsPlaying(false);
    setInputValue('');
    setInputIndex('');
    setInputRow('');
    setInputCol('');
    setTreeInputType('num');
    setTreeTraversalMode('inorder');
    setPointerTargetType('int');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Handle auto-playing of animation steps
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIdx((prevIdx) => {
          if (prevIdx < timeline.length - 1) {
            const nextIdx = prevIdx + 1;
            setStructureState(timeline[nextIdx].state);
            return nextIdx;
          } else {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return prevIdx;
          }
        });
      }, animationSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeline, animationSpeed]);

  // Initializing state generator / Reset functionality
  const handleReset = () => {
    setStructureState(activeStructure.defaultState);
    setTimeline([]);
    setCurrentStepIdx(-1);
    setIsPlaying(false);
  };

  // Triggers the animation timeline generation
  const runOperation = (operation) => {
    const isChar = activeStructure.id === 'character' || 
                   (['bst', 'avl'].includes(activeStructure.id) && treeInputType === 'char') ||
                   (activeStructure.id === 'pointer' && pointerTargetType === 'char') ||
                   (activeStructure.id === 'hash_set' && inputValue && isNaN(parseInt(inputValue))) ||
                   (activeStructure.category === 'searching' && inputValue && isNaN(parseInt(inputValue)));

    const inputs = {
      value: inputValue,
      index: inputIndex,
      row: inputRow,
      col: inputCol,
      mode: activeStructure.id === 'graph' ? graphMode : treeTraversalMode,
      isChar: isChar,
      structureType: structureState.structureType
    };

    const steps = generateSteps(activeStructure.id, operation, structureState, inputs);
    if (steps && steps.length > 0) {
      setTimeline(steps);
      setCurrentStepIdx(0);
      setStructureState(steps[0].state);
      setIsPlaying(true);
      // Scroll viewport so the visualizer section top is in view (all screen sizes)
      if (visualizerRef.current) {
        const top = visualizerRef.current.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    }
  };

  // Standard animation stepping
  const stepForward = () => {
    setIsPlaying(false);
    if (currentStepIdx < timeline.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      setStructureState(timeline[nextIdx].state);
    }
  };

  const stepBackward = () => {
    setIsPlaying(false);
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      setStructureState(timeline[prevIdx].state);
    }
  };

  // Filter structures by category
  const filteredStructures = DATA_STRUCTURES.filter(ds => 
    selectedCategory === 'all' || ds.category === selectedCategory
  );

  // Helper to color code category tags
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'primitives': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'linear': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'nonlinear': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'hash-based': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'primitives': return <Sliders size={15} />;
      case 'linear': return <ListCollapse size={15} />;
      case 'nonlinear': return <Network size={15} />;
      case 'hash-based': return <Hash size={15} />;
      default: return <Layers size={15} />;
    }
  };

  // Helper to tokenize code lines without using dangerouslySetInnerHTML
  const tokenizeLine = (line) => {
    if (!line) return [];
    // Regex matching: Comments, Strings, Keywords, Control Flows, and Numbers
    const regex = /(\/\/.*$|#.*$)|("[^"]*"|'[^']*')|\b(int|float|char|bool|boolean|void|struct|class|def|import|from|return)\b|\b(if|else|while|do|for|in)\b|\b([0-9]+)\b/g;
    let lastIndex = 0;
    const result = [];
    let match;
    let keyIdx = 0;

    while ((match = regex.exec(line)) !== null) {
      // Add leading plain text
      if (match.index > lastIndex) {
        result.push(line.substring(lastIndex, match.index));
      }

      const [, comment, string, keyword, control, number] = match;

      if (comment) {
        result.push(<span key={keyIdx++} className="text-slate-500">{comment}</span>);
      } else if (string) {
        result.push(<span key={keyIdx++} className="text-emerald-300">{string}</span>);
      } else if (keyword) {
        result.push(<span key={keyIdx++} className="text-purple-400 font-bold">{keyword}</span>);
      } else if (control) {
        result.push(<span key={keyIdx++} className="text-pink-400">{control}</span>);
      } else if (number) {
        result.push(<span key={keyIdx++} className="text-amber-300">{number}</span>);
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      result.push(line.substring(lastIndex));
    }

    return result;
  };

  // Syntax highlighter mockup for multilingual view
  const renderCodeSnippet = (snippet) => {
    if (!snippet) return null;
    return snippet.split('\n').map((line, idx) => {
      const tokens = tokenizeLine(line);
      return (
        <div key={idx} className="table-row">
          <span className="table-cell pr-4 text-slate-600 text-right select-none text-[10px] w-6">{idx + 1}</span>
          <span className="table-cell font-mono whitespace-pre text-xs">
            {tokens.length > 0 ? tokens : '\u00A0'}
          </span>
        </div>
      );
    });
  };

  const getTimeComplexity = () => {
    if (!activeStructure) return '';
    const id = activeStructure.id;
    if (id === 'bubble_sort' || id === 'selection_sort' || id === 'insertion_sort') return 'O(N²)';
    if (id === 'merge_sort' || id === 'quick_sort') return 'O(N log N)';
    if (id === 'bst') return 'O(log N)';
    if (id === 'avl') return 'O(log N)';
    if (id === 'binary_search') return 'O(log N)';
    if (id === 'linear_search') return 'O(N)';
    if (id === 'graph') return 'O(V + E)';
    if (id === 'hash_table' || id === 'hash_set') return 'O(1)';
    if (['stack', 'queue', 'circular_queue', 'deque'].includes(id)) return 'O(1)';
    if (['singly_linked_list', 'doubly_linked_list', 'circular_linked_list', 'doubly_circular_linked_list', 'array1d'].includes(id)) return 'O(N)';
    if (id === 'array2d') return 'O(R*C)';
    if (['integer', 'float', 'character', 'boolean', 'pointer'].includes(id)) return 'O(1)';
    return 'O(1)';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      
      {/* --- HEADER --- */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between max-w-7xl mx-auto gap-4">
          {/* Logo + Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20 text-white">
                <Cpu size={22} className="animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-indigo-200 to-blue-400 bg-clip-text text-transparent m-0">
                  {t('title')}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">{t('subtitle')}</p>
              </div>
            </div>

            {/* Mobile-only Complexity Button */}
            <div className="md:hidden relative" ref={complexityRef}>
              <button
                onClick={() => setIsComplexityOpen(!isComplexityOpen)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
              >
                <Activity size={12} />
                {isComplexityOpen ? 'Hide' : 'Complexity'}
              </button>

              {/* Complexity Dropdown Panel */}
              {isComplexityOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-3 shadow-2xl shadow-slate-950/60 w-max max-w-[90vw] animate-fade-in">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2.5 px-1">
                    {activeStructure.name} — Complexities
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {activeStructure.category === 'sorting' ? (
                      <>
                        <div className="flex items-center justify-between gap-4 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
                          <span className="text-[8px] font-bold text-purple-400 uppercase tracking-widest whitespace-nowrap">Best</span>
                          <span className="text-xs font-mono font-bold text-white whitespace-nowrap">{activeStructure.complexities.best}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
                          <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest whitespace-nowrap">Average</span>
                          <span className="text-xs font-mono font-bold text-white whitespace-nowrap">{activeStructure.complexities.avg}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
                          <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest whitespace-nowrap">Worst</span>
                          <span className="text-xs font-mono font-bold text-white whitespace-nowrap">{activeStructure.complexities.worst}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-4 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
                          <span className="text-[8px] font-bold text-purple-400 uppercase tracking-widest whitespace-nowrap">{t('search')}</span>
                          <span className="text-xs font-mono font-bold text-white whitespace-nowrap">{activeStructure.complexities.search}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
                          <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest whitespace-nowrap">{t('insert')}</span>
                          <span className="text-xs font-mono font-bold text-white whitespace-nowrap">{activeStructure.complexities.insert}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
                          <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest whitespace-nowrap">{t('delete')}</span>
                          <span className="text-xs font-mono font-bold text-white whitespace-nowrap">{activeStructure.complexities.delete}</span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center justify-between gap-4 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest whitespace-nowrap">{t('space')}</span>
                      <span className="text-xs font-mono font-bold text-white whitespace-nowrap">{activeStructure.complexities.space}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest whitespace-nowrap">{t('time')}</span>
                      <span className="text-xs font-mono font-bold text-white whitespace-nowrap">{getTimeComplexity()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Complexity HUD — desktop only */}
          <div className="hidden md:flex flex-wrap items-center gap-3">
            {activeStructure.category === 'sorting' ? (
              <>
                <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-center min-w-[70px]">
                  <span className="block text-[8px] font-bold text-purple-400 uppercase tracking-widest">Best</span>
                  <span className="text-xs font-mono font-bold text-white">{activeStructure.complexities.best}</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-center min-w-[70px]">
                  <span className="block text-[8px] font-bold text-blue-400 uppercase tracking-widest">Average</span>
                  <span className="text-xs font-mono font-bold text-white">{activeStructure.complexities.avg}</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-center min-w-[70px]">
                  <span className="block text-[8px] font-bold text-rose-400 uppercase tracking-widest">Worst</span>
                  <span className="text-xs font-mono font-bold text-white">{activeStructure.complexities.worst}</span>
                </div>
              </>
            ) : (
              <>
                <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-center min-w-[70px]">
                  <span className="block text-[8px] font-bold text-purple-400 uppercase tracking-widest">{t('search')}</span>
                  <span className="text-xs font-mono font-bold text-white">{activeStructure.complexities.search}</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-center min-w-[70px]">
                  <span className="block text-[8px] font-bold text-blue-400 uppercase tracking-widest">{t('insert')}</span>
                  <span className="text-xs font-mono font-bold text-white">{activeStructure.complexities.insert}</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-center min-w-[70px]">
                  <span className="block text-[8px] font-bold text-rose-400 uppercase tracking-widest">{t('delete')}</span>
                  <span className="text-xs font-mono font-bold text-white">{activeStructure.complexities.delete}</span>
                </div>
              </>
            )}
            <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-center min-w-[70px]">
              <span className="block text-[8px] font-bold text-emerald-400 uppercase tracking-widest">{t('space')}</span>
              <span className="text-xs font-mono font-bold text-white">{activeStructure.complexities.space}</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-center min-w-[75px]">
              <span className="block text-[8px] font-bold text-amber-400 uppercase tracking-widest">{t('time')}</span>
              <span className="text-xs font-mono font-bold text-white">{getTimeComplexity()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT LAYOUT --- */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-6 p-6">
        
        {/* --- LEFT SIDEBAR (Category filter + 19 structures list) --- */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
          
          {/* Toggle Sidebar Button for Mobile View */}
          <div className="lg:hidden flex justify-between items-center bg-slate-900/60 border border-slate-900 p-4 rounded-2xl">
            <span className="text-xs font-bold text-slate-350 uppercase tracking-wider">Structures Playground</span>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-purple-500/10"
            >
              {isSidebarOpen ? 'Hide List' : 'Select Structure'}
            </button>
          </div>

          <div className={`${isSidebarOpen ? 'flex' : 'hidden'} lg:flex flex-col gap-4`}>
            {/* Category Filter */}
            <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl w-full">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{t('categories')}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-2 text-left rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                    selectedCategory === 'all' 
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/10' 
                      : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Layers size={13} />
                  <span>{t('allStructures')}</span>
                </button>
                {Object.entries(CATEGORIES).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-3 py-2 text-left rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                      selectedCategory === key 
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/10' 
                        : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    {getCategoryIcon(key)}
                    <span>{t(`categoriesList.${key}`, label)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Structures List */}
            <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl overflow-y-auto max-h-[350px] lg:max-h-[500px] w-full">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('structures')}</h2>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full font-bold text-slate-300">
                  {filteredStructures.length}
                </span>
              </div>
              <div className="space-y-1">
                {filteredStructures.map((ds) => {
                  const isActive = activeStructure.id === ds.id;
                  return (
                    <button
                      key={ds.id}
                      onClick={() => {
                        handleStructureSelect(ds);
                        setIsSidebarOpen(false); // Close on mobile after selection
                      }}
                      className={`w-full px-3.5 py-2.5 text-left rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20' 
                          : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800/60 hover:text-white border border-slate-900/40'
                      }`}
                    >
                      <span>{t(`structuresData.${ds.id}`, ds.name)}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold tracking-tight border ${
                        isActive ? 'bg-white/20 border-white/10 text-white' : getCategoryColor(ds.category)
                      }`}>
                        {t(`categoriesList.${ds.category}`, ds.category).replace('hash-based', 'hash').slice(0, 4)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* --- MAIN CENTER + RIGHT AREA --- */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Visualizer Canvas & Live Explanation */}
          <section ref={visualizerRef} className="glass-panel rounded-3xl p-6 flex flex-col gap-4">
            
            {/* Header info */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className={`text-[9px] px-2 py-0.5 border rounded-full font-bold uppercase tracking-wider ${getCategoryColor(activeStructure.category)}`}>
                  {t(`categoriesList.${activeStructure.category}`, Reflect.get(CATEGORIES, activeStructure.category))}
                </span>
                <h2 className="text-xl font-bold text-white mt-1.5">
                  {t(`structuresData.${activeStructure.id}`, activeStructure.name)} {t('visualizerSuffix')}
                </h2>
              </div>
              <button 
                onClick={handleReset}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                title={t('resetState')}
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Rendering Canvas & HUD */}
            {(() => {
              const currentStep = currentStepIdx >= 0 ? Reflect.get(timeline, currentStepIdx) : null;
              
              const getStepStatus = () => {
                if (!currentStep) return null;
                if (currentStep.status) return currentStep.status;
                const desc = (currentStep.description || '').toLowerCase();
                const label = (currentStep.state?.label || '').toLowerCase();
                const failKeywords = [
                  'not found', 'failed', 'empty', 'overflow', 'underflow', 
                  'ignored', 'nothing deleted', 'cannot', 'does not exist', 
                  'not present', 'no match', 'fail', 'was not found', 'search failed',
                  'already exists', 'duplicate', 'full'
                ];
                if (failKeywords.some(kw => desc.includes(kw) || label.includes(kw))) {
                  return 'fail';
                }
                return 'success';
              };

              const status = getStepStatus();
              let hudBorderClass = 'border-slate-900/80';
              let hudIconBgClass = 'bg-purple-500/10 text-purple-400';
              
              if (status === 'success') {
                hudBorderClass = 'border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
                hudIconBgClass = 'bg-emerald-500/20 text-emerald-400';
              } else if (status === 'fail') {
                hudBorderClass = 'border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]';
                hudIconBgClass = 'bg-rose-500/20 text-rose-400';
              }

              return (
                <>
                  <div className="w-full overflow-x-auto lg:overflow-x-visible vis-mobile-scroll">
                    <Visualizer 
                      structureId={activeStructure.id} 
                      state={structureState} 
                      currentStep={currentStep} 
                      stepStatus={status} 
                    />
                  </div>

                  {/* Step Description HUD */}
                  <div className={`p-4 bg-slate-950/80 border ${hudBorderClass} rounded-2xl flex items-start justify-between gap-3 transition-all duration-300`}>
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`p-2 ${hudIconBgClass} rounded-lg shrink-0 transition-colors duration-300`}>
                        <Activity size={18} className={isPlaying ? 'animate-pulse' : ''} />
                      </div>
                      <p className="text-sm font-medium text-slate-300 tracking-wide leading-relaxed">
                        {currentStep
                          ? currentStep.description
                          : t('systemIdle')}
                      </p>
                    </div>
                    {timeline.length > 0 && (
                      <span className="text-[10px] font-mono font-bold bg-slate-900 px-3 py-1 rounded-full text-slate-400 shrink-0 ml-4 border border-slate-800">
                        {t('stepCounter', { current: currentStepIdx + 1, total: timeline.length })}
                      </span>
                    )}
                  </div>
                </>
              );
            })()}
          </section>

          {/* Controls Bar + Operations Form */}
          <section className="glass-panel rounded-3xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Operations Actions Panel */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('operations')}</h3>
              
              {/* Form Input fields */}
              <div className="flex flex-wrap items-center gap-3">
                {activeStructure.id !== 'boolean' && activeStructure.category !== 'sorting' && activeStructure.id !== 'graph' && (
                  <input
                    type={
                      ['hash_table', 'character'].includes(activeStructure.id) ||
                      (['bst', 'avl'].includes(activeStructure.id) && treeInputType === 'char') ||
                      (activeStructure.id === 'pointer' && pointerTargetType === 'char') ||
                      (activeStructure.category === 'searching' && isNaN(parseInt(inputValue)))
                        ? 'text'
                        : 'number'
                    }
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      activeStructure.id === 'hash_table' 
                        ? t('placeholder.keyTable') 
                        : (activeStructure.id === 'character' || 
                           (['bst', 'avl'].includes(activeStructure.id) && treeInputType === 'char') || 
                           (activeStructure.id === 'pointer' && pointerTargetType === 'char')) 
                          ? t('placeholder.char') 
                          : t('placeholder.num')
                    }
                    className="flex-1 min-w-[130px] px-3.5 py-2 bg-slate-950 border border-slate-900 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all font-mono"
                  />
                )}
                
                {['array1d', 'singly_linked_list', 'doubly_linked_list', 'circular_linked_list', 'doubly_circular_linked_list'].includes(activeStructure.id) && (
                  <input
                    type="number"
                    value={inputIndex}
                    onChange={(e) => setInputIndex(e.target.value)}
                    placeholder={t('placeholder.index')}
                    className="w-20 px-3.5 py-2 bg-slate-950 border border-slate-900 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-purple-600 transition-all font-mono"
                  />
                )}

                {activeStructure.id === 'array2d' && (
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <input
                      type="number"
                      value={inputRow}
                      onChange={(e) => setInputRow(e.target.value)}
                      placeholder={t('placeholder.row')}
                      className="w-14 px-2 py-2 bg-slate-950 border border-slate-900 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-purple-600 transition-all font-mono"
                    />
                    <input
                      type="number"
                      value={inputCol}
                      onChange={(e) => setInputCol(e.target.value)}
                      placeholder={t('placeholder.col')}
                      className="w-14 px-2 py-2 bg-slate-950 border border-slate-900 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-purple-600 transition-all font-mono"
                    />
                  </div>
                )}

                {activeStructure.id === 'pointer' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-500 font-bold font-mono uppercase">{t('target')}</span>
                    <select
                      value={pointerTargetType}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setPointerTargetType(newType);
                        setStructureState({
                          value: '0x7ffd',
                          pointsTo: '0x7ffe',
                          targetValue: newType === 'int' ? 88 : newType === 'float' ? 3.14 : 'A'
                        });
                        setTimeline([]);
                        setCurrentStepIdx(-1);
                        setIsPlaying(false);
                      }}
                      className="px-2 py-1.5 bg-slate-950 border border-slate-900 rounded-xl text-xs font-semibold text-white focus:outline-none"
                    >
                      <option value="int">{t('dataType.int')}</option>
                      <option value="float">{t('dataType.float')}</option>
                      <option value="char">{t('dataType.char')}</option>
                    </select>
                  </div>
                )}

                {['bst', 'avl'].includes(activeStructure.id) && (
                  <div className="flex items-center space-x-2 bg-slate-950 p-1 border border-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-bold font-mono uppercase px-1.5">{t('keyType')}</span>
                    <button
                      onClick={() => {
                        setTreeInputType('num');
                        setStructureState(activeStructure.defaultState);
                        setTimeline([]);
                        setCurrentStepIdx(-1);
                        setIsPlaying(false);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                        treeInputType === 'num' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      {t('num')}
                    </button>
                    <button
                      onClick={() => {
                        setTreeInputType('char');
                        const charDefaultState = {
                          nodes: [
                            { val: 'M', parent: null, x: 50, y: 15, left: 'F', right: 'S' },
                            { val: 'F', parent: 'M', x: 25, y: 35, left: 'C', right: 'H' },
                            { val: 'S', parent: 'M', x: 75, y: 35, left: 'P', right: 'W' },
                            { val: 'C', parent: 'F', x: 12, y: 55, left: null, right: null },
                            { val: 'H', parent: 'F', x: 38, y: 55, left: null, right: null },
                            { val: 'P', parent: 'S', x: 62, y: 55, left: null, right: null },
                            { val: 'W', parent: 'S', x: 88, y: 55, left: null, right: null }
                          ],
                          activeVal: null,
                          comparedVal: null
                        };
                        const avlCharDefaultState = {
                          nodes: [
                            { val: 'M', parent: null, bf: 0, x: 50, y: 15, left: 'F', right: 'S' },
                            { val: 'F', parent: 'M', bf: 0, x: 25, y: 35, left: 'C', right: 'H' },
                            { val: 'S', parent: 'M', bf: 0, x: 75, y: 35, left: null, right: null },
                            { val: 'C', parent: 'F', bf: 0, x: 12, y: 55, left: null, right: null },
                            { val: 'H', parent: 'F', bf: 0, x: 38, y: 55, left: null, right: null }
                          ],
                          activeVal: null,
                          rotationLabel: ''
                        };
                        setStructureState(activeStructure.id === 'avl' ? avlCharDefaultState : charDefaultState);
                        setTimeline([]);
                        setCurrentStepIdx(-1);
                        setIsPlaying(false);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                        treeInputType === 'char' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      {t('charLabel')}
                    </button>
                  </div>
                )}

                {activeStructure.category === 'searching' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-500 font-bold font-mono uppercase">{t('structureLabel')}</span>
                    <select
                      value={structureState.structureType ?? 'array1d'}
                      onChange={(e) => {
                        const sType = e.target.value;
                        if (sType === 'array1d') {
                          setStructureState({ 
                            arr: activeStructure.id === 'binary_search' ? [5, 12, 23, 34, 45, 56, 67, 78, 89] : [12, 45, 78, 23, 56, 89], 
                            activeIdx: -1, 
                            low: 0, 
                            high: activeStructure.id === 'binary_search' ? 8 : 5, 
                            mid: -1, 
                            label: '', 
                            structureType: 'array1d' 
                          });
                        } else if (sType === 'array2d') {
                          setStructureState({
                            grid: activeStructure.id === 'binary_search' 
                              ? [[5, 12, 23], [34, 45, 56], [67, 78, 89]] 
                              : [[12, 45, 78], [23, 56, 89]],
                            activeRow: -1,
                            activeCol: -1,
                            low: 0,
                            high: 8,
                            mid: -1,
                            label: '',
                            structureType: 'array2d'
                          });
                        } else if (sType === 'singly_linked_list' || sType === 'doubly_linked_list') {
                          setStructureState({ 
                            nodes: activeStructure.id === 'binary_search' ? [5, 12, 23, 34, 45, 56, 67, 78, 89] : [12, 45, 78, 23, 56, 89], 
                            activeIdx: -1, 
                            low: 0,
                            high: activeStructure.id === 'binary_search' ? 8 : 5,
                            mid: -1,
                            label: '', 
                            structureType: sType 
                          });
                        } else if (sType === 'stack') {
                          setStructureState({
                            stack: [12, 45, 78, 23, 56, 89],
                            activeIdx: -1,
                            label: '',
                            structureType: 'stack'
                          });
                        } else if (sType === 'queue' || sType === 'deque') {
                          setStructureState({
                            queue: [12, 45, 78, 23, 56, 89],
                            deque: [12, 45, 78, 23, 56, 89],
                            activeIdx: -1,
                            label: '',
                            structureType: sType
                          });
                        } else if (sType === 'bst' || sType === 'avl' || sType === 'tree') {
                          setStructureState({
                            nodes: [
                              { val: 50, parent: null, x: 50, y: 15, left: 30, right: 70 },
                              { val: 30, parent: 50, x: 25, y: 35, left: 20, right: 40 },
                              { val: 70, parent: 50, x: 75, y: 35, left: 60, right: 80 },
                              { val: 20, parent: 30, x: 12, y: 55, left: null, right: null },
                              { val: 40, parent: 30, x: 38, y: 55, left: null, right: null },
                              { val: 60, parent: 70, x: 62, y: 55, left: null, right: null },
                              { val: 80, parent: 70, x: 88, y: 55, left: null, right: null }
                            ],
                            activeVal: null,
                            comparedVal: null,
                            label: '',
                            structureType: sType
                          });
                        }
                        setTimeline([]);
                        setCurrentStepIdx(-1);
                        setIsPlaying(false);
                      }}
                      className="px-3.5 py-2 bg-slate-950 border border-slate-900 rounded-xl text-xs font-semibold text-white focus:outline-none"
                    >
                      <option value="array1d">{t('structuresList.array1d')}</option>
                      <option value="array2d">{t('structuresList.array2d')}</option>
                      <option value="singly_linked_list">{t('structuresList.singly_linked_list')}</option>
                      {activeStructure.id === 'linear_search' && <option value="doubly_linked_list">{t('structuresList.doubly_linked_list')}</option>}
                      {activeStructure.id === 'linear_search' && <option value="stack">{t('structuresList.stack')}</option>}
                      {activeStructure.id === 'linear_search' && <option value="queue">{t('structuresList.queue')}</option>}
                      {activeStructure.id === 'linear_search' && <option value="deque">{t('structuresList.deque')}</option>}
                      {activeStructure.id === 'linear_search' && <option value="tree">{t('structuresList.tree')}</option>}
                      {activeStructure.id === 'binary_search' && <option value="bst">{t('structuresList.bst')}</option>}
                      {activeStructure.id === 'binary_search' && <option value="avl">{t('structuresList.avl')}</option>}
                    </select>
                  </div>
                )}

                {activeStructure.id === 'graph' && (
                  <select
                    value={graphMode}
                    onChange={(e) => setGraphMode(e.target.value)}
                    className="px-3.5 py-2 bg-slate-950 border border-slate-900 rounded-xl text-xs font-medium text-white focus:outline-none"
                  >
                    <option value="BFS">{t('structuresList.bfs')}</option>
                    <option value="DFS">{t('structuresList.dfs')}</option>
                  </select>
                )}
              </div>

              {/* Action Buttons based on current structure */}
              <div className="flex flex-wrap gap-2">
                {/* --- Primitives --- */}
                {activeStructure.category === 'primitives' && activeStructure.id !== 'boolean' && (
                  <button 
                    onClick={() => runOperation('update')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/10 flex items-center space-x-1.5"
                  >
                    <Plus size={13} />
                    <span>{t('setValue')}</span>
                  </button>
                )}

                {activeStructure.id === 'boolean' && (
                  <button 
                    onClick={() => runOperation('toggle')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
                  >
                    <RefreshCw size={13} />
                    <span>{t('toggleLogicalValue')}</span>
                  </button>
                )}

                {/* --- 1D Array --- */}
                {activeStructure.id === 'array1d' && (
                  <>
                    <button 
                      onClick={() => runOperation('search')}
                      className="px-3.5 py-2 bg-purple-600/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Search size={13} />
                      <span>{t('search')}</span>
                    </button>
                    <button 
                      onClick={() => runOperation('insert')}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Plus size={13} />
                      <span>{t('insertAtIndex')}</span>
                    </button>
                    <button 
                      onClick={() => runOperation('delete')}
                      className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Trash2 size={13} />
                      <span>{t('deleteAtIndex')}</span>
                    </button>
                  </>
                )}

                {/* --- 2D Array --- */}
                {activeStructure.id === 'array2d' && (
                  <>
                    <button 
                      onClick={() => runOperation('search')}
                      className="px-3.5 py-2 bg-purple-600/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Search size={13} />
                      <span>{t('searchGrid')}</span>
                    </button>
                    <button 
                      onClick={() => runOperation('insert')}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Plus size={13} />
                      <span>{t('insertAtRC')}</span>
                    </button>
                    <button 
                      onClick={() => runOperation('delete')}
                      className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Trash2 size={13} />
                      <span>{t('deleteAtRC')}</span>
                    </button>
                  </>
                )}

                {/* --- Linked Lists --- */}
                {['singly_linked_list', 'doubly_linked_list', 'circular_linked_list', 'doubly_circular_linked_list'].includes(activeStructure.id) && (
                  <>
                    <button 
                      onClick={() => runOperation('search')}
                      className="px-3.5 py-2 bg-purple-600/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Search size={13} />
                      <span>{t('search')}</span>
                    </button>
                    <button 
                      onClick={() => runOperation('insert_head')}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Plus size={13} />
                      <span>{t('insertHead')}</span>
                    </button>
                    <button 
                      onClick={() => runOperation('insert_tail')}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Plus size={13} />
                      <span>{t('insertTail')}</span>
                    </button>
                    <button 
                      onClick={() => runOperation('insert_index')}
                      className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Plus size={13} />
                      <span>{t('insertAtIndex')}</span>
                    </button>
                    <button 
                      onClick={() => runOperation('delete')}
                      className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Trash2 size={13} />
                      <span>{t('deleteValue')}</span>
                    </button>
                  </>
                )}

                {/* --- Searching Algorithms --- */}
                {activeStructure.category === 'searching' && (
                  <button 
                    onClick={() => runOperation('search')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <Search size={13} />
                    <span>{t('runSearch')}</span>
                  </button>
                )}

                {/* --- Sorting Algorithms --- */}
                {activeStructure.category === 'sorting' && (
                  <div className="w-full border border-purple-500/25 bg-purple-500/5 rounded-2xl p-3 flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest w-full mb-0.5">Sorting</span>
                    <button 
                      onClick={() => runOperation('sort')}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-purple-500/15"
                    >
                      <Play size={13} />
                      <span>{t('runSort')}</span>
                    </button>
                  </div>
                )}

                {/* --- Stack --- */}
                {activeStructure.id === 'stack' && (
                  <>
                    <button 
                      onClick={() => runOperation('push')}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Plus size={13} />
                      <span>{t('push')}</span>
                    </button>
                    <button 
                      onClick={() => runOperation('pop')}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Trash2 size={13} />
                      <span>{t('pop')}</span>
                    </button>
                    <button 
                      onClick={() => runOperation('search')}
                      className="px-4 py-2 bg-purple-600/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Search size={13} />
                      <span>{t('search')}</span>
                    </button>
                  </>
                )}

                {/* --- Queue / Circular Queue --- */}
                {['queue', 'circular_queue'].includes(activeStructure.id) && (
                  <>
                    <button 
                      onClick={() => runOperation('enqueue')}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Plus size={13} />
                      <span>{t('enqueue')}</span>
                    </button>
                    <button 
                      onClick={() => runOperation('dequeue')}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Trash2 size={13} />
                      <span>{t('dequeue')}</span>
                    </button>
                    <button 
                      onClick={() => runOperation('search')}
                      className="px-4 py-2 bg-purple-600/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Search size={13} />
                      <span>{t('search')}</span>
                    </button>
                  </>
                )}

                {/* --- Deque --- */}
                {activeStructure.id === 'deque' && (
                  <>
                    <button 
                      onClick={() => runOperation('insert_front')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      + {t('placeholder.front')}
                    </button>
                    <button 
                      onClick={() => runOperation('insert_rear')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      + {t('placeholder.rear')}
                    </button>
                    <button 
                      onClick={() => runOperation('delete_front')}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all"
                    >
                      - {t('placeholder.front')}
                    </button>
                    <button 
                      onClick={() => runOperation('delete_rear')}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all"
                    >
                      - {t('placeholder.rear')}
                    </button>
                    <button 
                      onClick={() => runOperation('search')}
                      className="px-3.5 py-2 bg-purple-600/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Search size={13} />
                      <span>{t('search')}</span>
                    </button>
                  </>
                )}

                {/* --- Trees (BST / AVL) --- */}
                {['bst', 'avl'].includes(activeStructure.id) && (
                  <>
                    <button 
                      onClick={() => runOperation('insert')}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Plus size={13} />
                      <span>{t('insertNode')}</span>
                    </button>
                    <button 
                      onClick={() => runOperation('delete')}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Trash2 size={13} />
                      <span>{t('deleteNode')}</span>
                    </button>
                    <button 
                      onClick={() => runOperation('search')}
                      className="px-4 py-2 bg-purple-600/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Search size={13} />
                      <span>{t('search')}</span>
                    </button>
                    {/* Traversal bordered section */}
                    <div className="w-full border border-indigo-500/25 bg-indigo-500/5 rounded-2xl p-3 flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest w-full mb-0.5">{t('traversalType')}</span>
                      <select
                        value={treeTraversalMode}
                        onChange={(e) => setTreeTraversalMode(e.target.value)}
                        className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-indigo-600 transition-all"
                      >
                        <option value="inorder">{t('inorder')}</option>
                        <option value="preorder">{t('preorder')}</option>
                        <option value="postorder">{t('postorder')}</option>
                        <option value="levelorder">{t('levelorder')}</option>
                      </select>
                      <button 
                        onClick={() => runOperation('traverse')}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                      >
                        <Play size={11} />
                        <span>{t('traverse')}</span>
                      </button>
                    </div>
                  </>
                )}

                {/* --- Graph --- */}
                {activeStructure.id === 'graph' && (
                  <button 
                    onClick={() => runOperation('traverse')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <Play size={13} />
                    <span>{t('runTraversal')}</span>
                  </button>
                )}

                {/* --- Hash Table / Hash Set --- */}
                {['hash_table', 'hash_set'].includes(activeStructure.id) && (
                  <>
                    <button 
                      onClick={() => runOperation('insert')}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Plus size={13} />
                      <span>{t('insert')}</span>
                    </button>
                    <button 
                      onClick={() => runOperation('delete')}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Trash2 size={13} />
                      <span>{t('delete')}</span>
                    </button>
                    <button 
                      onClick={() => runOperation('search')}
                      className="px-4 py-2 bg-purple-600/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Search size={13} />
                      <span>{t('search')}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Animation Timeline Player Panel */}
            <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-900 pt-6 md:pt-0 md:pl-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('animationTimelineControls')}</h3>
              
              {/* Playback Button Group */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStepIdx <= 0}
                  className="p-2.5 bg-slate-900 border border-slate-855 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-slate-300 hover:text-white transition-all animate-none"
                  title={t('stepBackward')}
                >
                  <SkipBack size={16} />
                </button>
                
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={timeline.length === 0}
                  className={`p-3 border rounded-xl transition-all shadow-md ${
                    isPlaying 
                      ? 'bg-rose-600 border-rose-500 text-white shadow-rose-500/15' 
                      : 'bg-purple-600 border-purple-500 text-white disabled:bg-slate-900 disabled:border-slate-855 disabled:opacity-40 disabled:shadow-none'
                  }`}
                  title={isPlaying ? t('pause') : t('play')}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>

                <button
                  onClick={stepForward}
                  disabled={currentStepIdx >= timeline.length - 1}
                  className="p-2.5 bg-slate-900 border border-slate-855 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-slate-300 hover:text-white transition-all animate-none"
                  title={t('stepForward')}
                >
                  <SkipForward size={16} />
                </button>
              </div>

              {/* Speed Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold">
                  <span>{t('speedSlider')}</span>
                  <span className="text-purple-400">{animationSpeed}ms</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="100"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>
          </section>

          {/* Details & Code Snippets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Details Card */}
            <section className="glass-panel rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                <span>{t('details')}</span>
              </h3>
              <p className="text-xs leading-relaxed text-slate-400">
                {t(`structuresData.${activeStructure.id}.description`, activeStructure.description)}
              </p>
              
              <div className="space-y-3 pt-2">
                <div>
                  <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">{t('advantages')}</h4>
                  <ul className="text-xs space-y-1 text-slate-300">
                    {activeStructure.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-emerald-400 text-sm leading-none">•</span>
                        <span>{t(`structuresData.${activeStructure.id}.pros.${idx}`, pro)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">{t('disadvantages')}</h4>
                  <ul className="text-xs space-y-1 text-slate-300">
                    {activeStructure.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-rose-400 text-sm leading-none">•</span>
                        <span>{t(`structuresData.${activeStructure.id}.cons.${idx}`, con)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Code Viewer Panel */}
            <section className="glass-panel rounded-3xl p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <Code size={14} className="text-purple-400" />
                  <span>{t('standardImplementation')}</span>
                </h3>

                {/* Lang Select Tabs */}
                <div className="flex bg-slate-950 p-1 border border-slate-900 rounded-lg">
                  {['c', 'cpp', 'java', 'python'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLang(lang)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-colors ${
                        activeLang === lang 
                          ? 'bg-purple-600 text-white' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {lang === 'cpp' ? 'C++' : lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Container */}
              <div className="flex-1 bg-slate-950 border border-slate-900 rounded-2xl p-4 overflow-auto max-h-[220px] shadow-inner">
                <div className="table w-full border-collapse">
                  {renderCodeSnippet(Reflect.get(activeStructure.code, activeLang))}
                </div>
              </div>
            </section>

          </div>

        </main>
      </div>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-900 py-6 text-center text-[10px] text-slate-600 font-semibold max-w-7xl w-full mx-auto px-6">
        <div>{t('footerText')}</div>
      </footer>

    </div>
  );
}
