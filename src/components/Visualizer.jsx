import React from 'react';

export default function Visualizer({ structureId, state: mainState, currentStep, stepStatus }) {
  if (!mainState) return <div className="text-gray-400">No data state available.</div>;

  const [scale, setScale] = React.useState(1);
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef(null);

  const resetViewport = () => {
    setScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const nodes = mainState?.nodes || [];
  const nodesDep = nodes.map(n => `${n.val ?? n.id}:${n.x}:${n.y}`).join('|');
  const isTreeOrGraph = 
    structureId === 'bst' || 
    structureId === 'avl' || 
    structureId === 'graph' ||
    ((structureId === 'linear_search' || structureId === 'binary_search') && mainState?.structureType === 'tree');

  React.useEffect(() => {
    if (!isTreeOrGraph || nodes.length === 0) {
      resetViewport();
      return;
    }

    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      if (W === 0 || H === 0) return;

      const padding = 32;

      const nodePixelXs = nodes.map(n => (n.x / 100) * W);
      const nodePixelYs = nodes.map(n => (n.y / 100) * H);

      const minNodeX = Math.min(...nodePixelXs);
      const maxNodeX = Math.max(...nodePixelXs);
      const minNodeY = Math.min(...nodePixelYs);
      const maxNodeY = Math.max(...nodePixelYs);

      const contentWidth = maxNodeX - minNodeX;
      const contentHeight = maxNodeY - minNodeY;

      const scaleX = contentWidth > 0 ? (W - 2 * padding) / contentWidth : 1.0;
      const scaleY = contentHeight > 0 ? (H - 2 * padding) / contentHeight : 1.0;

      const targetScale = Math.min(scaleX, scaleY, 1.0);

      let panX = 0;
      let panY = 0;

      const targetLayoutId = ((structureId === 'linear_search' || structureId === 'binary_search') && mainState?.structureType === 'tree') ? 'bst' : structureId;

      if (targetLayoutId === 'graph') {
        const centerX = (minNodeX + maxNodeX) / 2;
        const centerY = (minNodeY + maxNodeY) / 2;
        panX = (W / 2 - centerX) * targetScale;
        panY = (H / 2 - centerY) * targetScale;
      } else {
        const centerX = (minNodeX + maxNodeX) / 2;
        panX = (W / 2 - centerX) * targetScale;
        panY = padding - H / 2 - (minNodeY - H / 2) * targetScale;
      }

      setScale(targetScale);
      setPanOffset({ x: panX, y: panY });
    }, 50);

    return () => clearTimeout(timer);
  }, [structureId, nodesDep, isTreeOrGraph]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = 0.05;
      setScale(prev => {
        const next = prev - e.deltaY * zoomFactor * 0.01;
        return Math.min(Math.max(next, 0.4), 3.0);
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Renderers for each data structure
  const renderContent = (structId = structureId, state = mainState) => {
    switch (structId) {
      // ================= PRIMITIVES =================
      case 'integer': {
        const val = state.value ?? 0;
        const size = state.size ?? 4;
        const binary = (val >>> 0).toString(2).padStart(32, '0').match(/.{1,8}/g).join(' ');
        const hex = '0x' + (val >>> 0).toString(16).toUpperCase().padStart(8, '0');
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-6 w-full max-w-lg mx-auto bg-slate-900/60 border border-slate-700/50 rounded-2xl backdrop-blur-xl shadow-2xl">
            <h3 className="text-sm font-semibold tracking-wider text-purple-400 uppercase">Memory Allocation (32-bit Integer)</h3>
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
                <span className="block text-xs text-gray-400">Value (Decimal)</span>
                <span className="text-3xl font-bold text-white">{val}</span>
              </div>
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
                <span className="block text-xs text-gray-400">Memory Size</span>
                <span className="text-3xl font-bold text-purple-300">{size} Bytes <span className="text-sm text-gray-400">({size * 8} bits)</span></span>
              </div>
            </div>
            <div className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-center">
              <span className="block text-xs text-gray-400 mb-2">Binary Representation (2's Complement)</span>
              <span className="text-sm sm:text-base text-emerald-400 tracking-widest break-all">{binary}</span>
            </div>
            <div className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-center">
              <span className="block text-xs text-gray-400 mb-1">Hexadecimal Address & Value</span>
              <div className="flex justify-around text-sm sm:text-base text-amber-400">
                <div>Address: <span className="text-gray-300">0x7FFD52AC</span></div>
                <div>Value: <span>{hex}</span></div>
              </div>
            </div>
          </div>
        );
      }

      case 'float': {
        const val = state.value ?? 3.14;
        const sign = state.sign ?? '0';
        const exponent = state.exponent ?? '10000000';
        const mantissa = state.mantissa ?? '10010001111010111000011';
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-6 w-full max-w-xl mx-auto bg-slate-900/60 border border-slate-700/50 rounded-2xl backdrop-blur-xl shadow-2xl">
            <h3 className="text-sm font-semibold tracking-wider text-purple-400 uppercase">IEEE-754 32-bit Single Precision Float</h3>
            
            <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl text-center w-full">
              <span className="block text-xs text-gray-400">Decimal Value</span>
              <span className="text-4xl font-extrabold text-white">{val}</span>
            </div>

            <div className="w-full space-y-2">
              <span className="block text-xs text-gray-400">Binary Bitfields</span>
              <div className="flex w-full border border-slate-700 rounded-xl overflow-hidden font-mono text-center text-sm shadow-md">
                <div className="w-1/12 bg-red-950/80 text-red-400 border-r border-slate-700 py-3" title="Sign Bit (1 bit)">
                  <span className="block text-xs text-red-500 font-bold">Sign</span>
                  <span className="text-lg font-bold">{sign}</span>
                </div>
                <div className="w-4/12 bg-emerald-950/80 text-emerald-400 border-r border-slate-700 py-3" title="Exponent (8 bits)">
                  <span className="block text-xs text-emerald-500 font-bold">Exponent</span>
                  <span className="text-lg font-bold tracking-tight">{exponent}</span>
                </div>
                <div className="w-7/12 bg-blue-950/80 text-blue-400 py-3" title="Mantissa/Fraction (23 bits)">
                  <span className="block text-xs text-blue-500 font-bold">Mantissa</span>
                  <span className="text-lg font-bold tracking-tighter break-all px-1">{mantissa}</span>
                </div>
              </div>
            </div>

            <div className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-xs text-gray-300 space-y-1">
              <div className="text-center font-semibold text-purple-400 mb-2">Math representation:</div>
              <div className="text-center text-sm">
                (-1)<sup>{sign}</sup> × 2<sup>{parseInt(exponent, 2)} - 127</sup> × (1 + 0.{(parseInt(mantissa, 2) / Math.pow(2, 23)).toFixed(4).split('.')[1]})
              </div>
            </div>
          </div>
        );
      }

      case 'character': {
        const val = state.value ?? 'A';
        const ascii = state.ascii ?? 65;
        const binary = state.binary ?? '01000001';
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-6 w-full max-w-sm mx-auto bg-slate-900/60 border border-slate-700/50 rounded-2xl backdrop-blur-xl shadow-2xl">
            <h3 className="text-sm font-semibold tracking-wider text-purple-400 uppercase">1-Byte Char Representation</h3>
            
            <div className="flex items-center justify-center w-28 h-28 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-3xl shadow-lg border border-purple-400/30 animate-pulse">
              <span className="text-6xl font-extrabold">{val}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full text-center">
              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
                <span className="block text-xs text-gray-400">ASCII Code</span>
                <span className="text-xl font-bold text-amber-400">{ascii}</span>
              </div>
              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
                <span className="block text-xs text-gray-400">Hexadecimal</span>
                <span className="text-xl font-bold text-emerald-400">0x{ascii.toString(16).toUpperCase()}</span>
              </div>
            </div>

            <div className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-center">
              <span className="block text-xs text-gray-400 mb-1">Binary Code</span>
              <span className="text-lg text-blue-400 tracking-wider">{binary}</span>
            </div>
          </div>
        );
      }

      case 'boolean': {
        const val = state.value ?? false;
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-6 w-full max-w-sm mx-auto bg-slate-900/60 border border-slate-700/50 rounded-2xl backdrop-blur-xl shadow-2xl">
            <h3 className="text-sm font-semibold tracking-wider text-purple-400 uppercase">Boolean Logical State</h3>

            <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 shadow-xl transition-all duration-500 ${
              val 
                ? 'bg-emerald-950/70 border-emerald-500 shadow-emerald-500/20 text-emerald-400' 
                : 'bg-rose-950/70 border-rose-500 shadow-rose-500/20 text-rose-400'
            }`}>
              <span className="text-3xl font-extrabold tracking-wide uppercase">{val ? 'True' : 'False'}</span>
              <span className="text-sm font-mono mt-1 opacity-70">Byte: {val ? '01' : '00'}</span>
            </div>

            <div className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-center text-xs text-gray-300">
              <div className="text-gray-400">C Representation: <span className="text-white font-bold">{val ? '1' : '0'}</span></div>
              <div className="text-gray-400 mt-1">Memory allocation: <span className="text-white font-bold">1 Byte (8 bits)</span></div>
            </div>
          </div>
        );
      }

      case 'pointer': {
        const val = state.value ?? '0x7ffd1000';
        const pointsTo = state.pointsTo ?? '0x7ffd1004';
        const targetValue = state.targetValue ?? 88;

        const isFloatVal = typeof targetValue === 'number' && !Number.isInteger(targetValue);
        const isCharVal = typeof targetValue === 'string';
        const typeStr = isCharVal ? 'char' : isFloatVal ? 'float' : 'int';
        const displayVal = isCharVal ? `'${targetValue}'` : targetValue;

        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-6 w-full max-w-xl mx-auto bg-slate-900/60 border border-slate-700/50 rounded-2xl backdrop-blur-xl shadow-2xl">
            <h3 className="text-sm font-semibold tracking-wider text-purple-400 uppercase">Pointer Variable & Target Dereference</h3>
            
            <div className="relative flex flex-col md:flex-row items-center justify-between w-full p-4 gap-8 md:gap-4">
              {/* Pointer Cell */}
              <div className="flex flex-col items-center p-4 bg-purple-950/40 border border-purple-500/30 rounded-xl w-44 shadow-lg">
                <span className="text-xs text-purple-400 font-bold mb-1">Pointer ({typeStr} *ptr)</span>
                <div className="w-full text-center py-2 bg-slate-950 border border-purple-800 rounded font-mono text-purple-300 text-sm">
                  {pointsTo}
                </div>
                <div className="text-[10px] text-gray-500 mt-2 font-mono">Address: {val}</div>
              </div>

              {/* Arrow Connection */}
              <div className="h-10 md:h-auto w-auto flex items-center justify-center">
                <svg className="w-20 h-10 overflow-visible text-amber-500" fill="none" viewBox="0 0 100 40">
                  <path d="M 0,20 L 85,20" stroke="currentColor" strokeWidth="3" markerEnd="url(#arrow)" strokeDasharray="4 2" />
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/>
                    </marker>
                  </defs>
                </svg>
              </div>

              {/* Target Cell */}
              <div className="flex flex-col items-center p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl w-44 shadow-lg">
                <span className="text-xs text-emerald-400 font-bold mb-1">Value Variable ({typeStr} val)</span>
                <div className="w-full text-center py-2 bg-slate-950 border border-emerald-800 rounded font-mono text-emerald-300 text-xl font-bold">
                  {displayVal}
                </div>
                <div className="text-[10px] text-gray-500 mt-2 font-mono">Address: {pointsTo}</div>
              </div>
            </div>

            <div className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-center text-xs text-gray-400">
              Dereference operation <code className="text-amber-300">*ptr</code> resolves to the value <span className="text-emerald-400 font-bold">{displayVal}</span>.
            </div>
          </div>
        );
      }

      // ================= LINEAR =================
      case 'array1d': {
        const arr = state.arr ?? [];
        const activeIdx = state.activeIdx ?? -1;
        const low = state.low !== undefined ? state.low : -1;
        const high = state.high !== undefined ? state.high : -1;
        const mid = state.mid !== undefined ? state.mid : -1;
        return (
          <div className="flex flex-col items-center p-6 space-y-6 w-full">
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              {arr.map((val, idx) => {
                const isActive = idx === activeIdx;
                const isLow = idx === low;
                const isHigh = idx === high;
                const isMid = idx === mid;
                return (
                  <div key={idx} className="flex flex-col items-center relative">
                    {/* Low/High/Mid indicators above cell if they exist */}
                    {(low !== -1 || high !== -1 || mid !== -1) && (
                      <div className="absolute top-[-20px] flex space-x-0.5 text-[8px] font-mono font-bold leading-none z-10">
                        {isLow && <span className="text-blue-400 bg-blue-500/10 px-1 rounded border border-blue-500/25">L</span>}
                        {isHigh && <span className="text-rose-400 bg-rose-500/10 px-1 rounded border border-rose-500/25">H</span>}
                        {isMid && <span className="text-amber-400 bg-amber-500/10 px-1 rounded border border-amber-500/25">M</span>}
                      </div>
                    )}
                    <span className="text-xs text-gray-500 font-mono mb-1 select-none">[{idx}]</span>
                    <div className={`w-14 h-14 flex items-center justify-center rounded-xl font-mono font-bold text-lg border-2 shadow transition-all duration-300 ${
                      isActive 
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-110 shadow-amber-500/20' 
                        : isMid
                        ? 'border-amber-500/50 text-amber-250 bg-slate-900 shadow-md shadow-amber-500/10'
                        : (low !== -1 && high !== -1 && (idx < low || idx > high))
                        ? 'bg-slate-950/40 border-slate-900 text-gray-600 border-dashed'
                        : 'bg-slate-800/80 border-slate-700 text-white'
                    }`}>
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
            {state.label && (
              <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-yellow-300 font-mono">
                {state.label}
              </div>
            )}
          </div>
        );
      }

      case 'array2d': {
        const grid = state.grid ?? [];
        const activeRow = state.activeRow ?? -1;
        const activeCol = state.activeCol ?? -1;
        const low = state.low !== undefined ? state.low : -1;
        const high = state.high !== undefined ? state.high : -1;
        const mid = state.mid !== undefined ? state.mid : -1;
        const cols = grid[0]?.length || 0;
        return (
          <div className="flex flex-col items-center p-6 space-y-4 w-full overflow-auto">
            <div className="inline-block p-4 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl">
              {grid.map((row, rIdx) => (
                <div key={rIdx} className="flex">
                  {row.map((val, cIdx) => {
                    const isActive = rIdx === activeRow && cIdx === activeCol;
                    const isRowHighlight = rIdx === activeRow && activeCol === -1;
                    const flatIdx = rIdx * cols + cIdx;
                    const isLow = flatIdx === low;
                    const isHigh = flatIdx === high;
                    const isMid = flatIdx === mid;
                    return (
                      <div key={cIdx} className="flex flex-col items-center m-1 relative">
                        {rIdx === 0 && <span className="text-[10px] text-gray-500 font-mono mb-1 select-none">C-{cIdx}</span>}
                        <div className="flex items-center">
                          {cIdx === 0 && <span className="text-[10px] text-gray-500 font-mono mr-2 w-6 text-right select-none">R-{rIdx}</span>}
                          <div className="relative">
                            {/* Low/High/Mid indicators for 2D binary search */}
                            {(low !== -1 || high !== -1 || mid !== -1) && (
                              <div className="absolute top-[-14px] left-0 right-0 flex justify-center space-x-0.5 text-[8px] font-mono font-bold leading-none z-10">
                                {isLow && <span className="text-blue-400 bg-blue-500/10 px-0.5 rounded border border-blue-500/25">L</span>}
                                {isHigh && <span className="text-rose-400 bg-rose-500/10 px-0.5 rounded border border-rose-500/25">H</span>}
                                {isMid && <span className="text-amber-400 bg-amber-500/10 px-0.5 rounded border border-amber-500/25">M</span>}
                              </div>
                            )}
                            <div className={`w-12 h-12 flex items-center justify-center rounded-lg font-mono font-semibold text-sm border transition-all duration-300 ${
                              isActive
                                ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-105 shadow-amber-500/30'
                                : isRowHighlight
                                ? 'bg-purple-500/10 border-purple-500/50 text-purple-300'
                                : isMid
                                ? 'border-amber-500/50 text-amber-250 bg-slate-900 shadow-md shadow-amber-500/10'
                                : (low !== -1 && high !== -1 && (flatIdx < low || flatIdx > high))
                                ? 'bg-slate-950/40 border-slate-900 text-gray-650 border-dashed'
                                : 'bg-slate-800/80 border-slate-700 text-white'
                            }`}>
                              {val}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'singly_linked_list':
      case 'doubly_linked_list':
      case 'circular_linked_list':
      case 'doubly_circular_linked_list': {
        const nodes = state.nodes ?? [];
        const activeIdx = state.activeIdx ?? -1;
        const low = state.low !== undefined ? state.low : -1;
        const high = state.high !== undefined ? state.high : -1;
        const mid = state.mid !== undefined ? state.mid : -1;
        const isDoubly = structId === 'doubly_linked_list' || structId === 'doubly_circular_linked_list' || state.structureType === 'doubly_linked_list';
        const isCircular = structId === 'circular_linked_list' || structId === 'doubly_circular_linked_list';
        const isDoublyCircular = structId === 'doubly_circular_linked_list';
        return (
          <div className="relative flex flex-col items-center p-8 w-full overflow-x-auto min-h-[220px]">
            <div className="flex items-center space-x-12 px-4 pt-4">
              {nodes.map((nodeVal, idx) => {
                const isActive = idx === activeIdx;
                const isLast = idx === nodes.length - 1;
                const isLow = idx === low;
                const isHigh = idx === high;
                const isMid = idx === mid;
                return (
                  <div key={idx} className="relative flex flex-col items-center shrink-0">
                    {/* Low/High/Mid indicators above node for binary search */}
                    {(low !== -1 || high !== -1 || mid !== -1) && (
                      <div className="absolute top-[-20px] flex space-x-0.5 text-[8px] font-mono font-bold leading-none z-10">
                        {isLow && <span className="text-blue-400 bg-blue-500/10 px-1 rounded border border-blue-500/25">L</span>}
                        {isHigh && <span className="text-rose-400 bg-rose-500/10 px-1 rounded border border-rose-500/25">H</span>}
                        {isMid && <span className="text-amber-400 bg-amber-500/10 px-1 rounded border border-amber-500/25">M</span>}
                      </div>
                    )}
                    <div className="relative flex items-center">
                      {/* Node Structure */}
                      <div className={`flex items-stretch border-2 rounded-xl overflow-hidden font-mono shadow-md transition-all duration-300 ${
                        isActive 
                          ? 'border-amber-400 ring-4 ring-amber-400/20 scale-105 shadow-amber-400/20' 
                          : isMid
                          ? 'border-amber-500/50 scale-105 shadow-md shadow-amber-500/10'
                          : (low !== -1 && high !== -1 && (idx < low || idx > high))
                          ? 'border-slate-900 opacity-40'
                          : 'border-slate-700'
                      }`}>
                        {/* Prev Pointer block for Doubly */}
                        {isDoubly && (
                          <div className="px-2 py-3 bg-slate-900 border-r border-slate-800 text-[10px] text-purple-400 flex items-center select-none font-bold">
                            {idx === 0 ? (isCircular ? '➔ Tail' : '•') : 'P'}
                          </div>
                        )}
                        {/* Node Value */}
                        <div className={`px-4 py-3 font-semibold text-lg flex items-center justify-center min-w-[50px] ${
                          isActive 
                            ? 'bg-amber-950/40 text-amber-300' 
                            : isMid
                            ? 'bg-amber-950/20 text-amber-250 font-bold'
                            : (low !== -1 && high !== -1 && (idx < low || idx > high))
                            ? 'bg-slate-950 text-gray-500'
                            : 'bg-slate-800 text-white'
                        }`}>
                          {nodeVal}
                        </div>
                        {/* Next Pointer Block */}
                        <div className="px-3 py-3 bg-slate-900 border-l border-slate-800 text-[10px] text-blue-400 flex items-center select-none font-bold">
                          {isLast ? (isCircular ? '➔ Head' : 'NULL') : 'N'}
                        </div>
                      </div>

                      {/* Forward Pointer Arrow */}
                      {!isLast && (
                        <div className="absolute right-[-44px] w-10 flex items-center justify-center text-blue-400">
                          {isDoubly ? (
                            <span className="text-xl tracking-tighter">⇄</span>
                          ) : (
                            <span className="text-xl">➔</span>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Index marker below node */}
                    <span className="text-[10px] text-slate-500 font-mono mt-2 bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-900 select-none">idx: {idx}</span>
                  </div>
                );
              })}
            </div>
            {isCircular && (
              <span className="text-xs text-purple-400 mt-5 font-mono font-bold bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 select-none">
                Circular Linked List: Last Node's Next points to Head {isDoublyCircular && '& Head\'s Prev points to Tail'}
              </span>
            )}
          </div>
        );
      }

      case 'stack': {
        const stack = state.stack ?? [];
        const activeIdx = state.activeIdx ?? -1;
        return (
          <div className="flex flex-col items-center p-6 space-y-4 w-full">
            <div className="relative w-44 border-b-4 border-x-4 border-slate-600 rounded-b-2xl p-3 bg-slate-900/40 flex flex-col-reverse gap-2 min-h-[220px]">
              {stack.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 font-mono">
                  Stack Empty
                </div>
              ) : (
                stack.map((val, idx) => {
                  const isActive = idx === activeIdx;
                  const isTop = idx === stack.length - 1;
                  return (
                    <div key={idx} className="flex items-center justify-between w-full relative">
                      <span className="text-[10px] text-gray-500 font-mono select-none font-bold">[{idx}]</span>
                      <div
                        className={`flex-1 ml-3 py-3 px-4 rounded-xl text-center font-mono font-bold border-2 transition-all duration-300 ${
                          isActive
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-105 shadow-md shadow-amber-500/20'
                            : 'bg-slate-800 border-slate-700 text-white'
                        }`}
                      >
                        {val}
                      </div>
                      {isTop && (
                        <span className="absolute right-[-70px] top-1/2 -translate-y-1/2 text-xs bg-purple-500/20 border border-purple-400 text-purple-300 px-2 py-0.5 rounded-full font-mono font-normal select-none">
                          ← TOP
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      }

      case 'queue':
      case 'deque': {
        const queue = state.queue ?? state.deque ?? [];
        const activeIdx = state.activeIdx ?? -1;
        const isDeque = structId === 'deque';
        return (
          <div className="flex flex-col items-center p-6 space-y-4 w-full">
            <div className="flex items-center border-y-4 border-slate-600 px-4 py-6 bg-slate-900/40 gap-3 rounded-md w-full max-w-xl min-h-[140px] justify-center relative">
              {queue.length === 0 ? (
                <div className="text-gray-500 text-sm font-mono">Queue Empty</div>
              ) : (
                queue.map((val, idx) => {
                  const isActive = idx === activeIdx;
                  const isFront = idx === 0;
                  const isRear = idx === queue.length - 1;
                  return (
                    <div key={idx} className="relative flex flex-col items-center">
                      <span className="text-[10px] text-gray-500 font-mono mb-1 select-none">[{idx}]</span>
                      <div className={`w-14 h-14 flex items-center justify-center rounded-xl font-mono font-bold text-lg border-2 shadow transition-all duration-300 ${
                        isActive
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-105 shadow-amber-500/20'
                          : 'bg-slate-800 border-slate-700 text-white'
                      }`}>
                        {val}
                      </div>
                      <div className="absolute bottom-[-24px] flex flex-col items-center whitespace-nowrap text-[10px] font-mono text-purple-400">
                        {isFront && <span className="text-blue-400 font-bold">▲ FRONT</span>}
                        {isRear && <span className="text-emerald-400 font-bold">▲ REAR</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {isDeque && (
              <span className="text-xs text-gray-400 mt-4 font-mono select-none">
                Double-Ended: Insert/Delete from both sides supported.
              </span>
            )}
          </div>
        );
      }

      case 'circular_queue': {
        const queue = state.queue ?? [];
        const front = state.front ?? 0;
        const rear = state.rear ?? 0;
        const size = state.size ?? 6;
        
        return (
          <div className="flex flex-col items-center p-6 w-full">
            <div className="relative w-64 h-64 border border-slate-800 rounded-full flex items-center justify-center bg-slate-900/20">
              {queue.map((val, idx) => {
                const angle = (idx * 2 * Math.PI) / size - Math.PI / 2;
                const radius = 90; // px
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);

                const isFront = idx === front;
                const isRear = idx === rear;
                const isOccupied = val !== null && val !== undefined;
                const isActive = idx === state.activeIdx;

                return (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                    className="flex flex-col items-center"
                  >
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-mono font-bold text-sm transition-all duration-300 ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-110 shadow-lg shadow-amber-500/30 ring-2 ring-amber-500/20'
                        : isOccupied 
                        ? 'bg-slate-800 border-slate-600 text-white' 
                        : 'bg-slate-950/60 border-slate-800 border-dashed text-gray-600'
                    }`}>
                      {isOccupied ? val : ''}
                    </div>
                    {/* Index tag */}
                    <span className="text-[9px] text-gray-500 font-mono mt-0.5">[{idx}]</span>
                    
                    {/* Pointers indicator tags */}
                    <div className="absolute top-[-22px] flex flex-col text-[8px] font-mono whitespace-nowrap leading-none">
                      {isFront && <span className="text-blue-400 font-bold">F</span>}
                      {isRear && <span className="text-emerald-400 font-bold">R</span>}
                    </div>
                  </div>
                );
              })}
              
              <div className="text-center font-mono text-xs text-gray-400 z-10 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
                <div>Front: <span className="text-blue-400 font-bold">{front}</span></div>
                <div>Rear: <span className="text-emerald-400 font-bold">{rear}</span></div>
              </div>
            </div>
          </div>
        );
      }

      // ================= NON-LINEAR =================
      case 'bst':
      case 'avl': {
        const nodes = state.nodes ?? [];
        const activeVal = state.activeVal ?? null;
        const comparedVal = state.comparedVal ?? null;
        
        // Find links
        const nodeMap = new Map(nodes.map(n => [n.val, n]));
        
        return (
          <div className="relative w-full min-h-[280px] p-4">
            {/* SVG lines for connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              {nodes.map((node) => {
                const lines = [];
                if (node.left !== null && node.left !== undefined && nodeMap.has(node.left)) {
                  const leftNode = nodeMap.get(node.left);
                  lines.push(
                    <line
                      key={`${node.val}-left`}
                      x1={`${node.x}%`}
                      y1={`${node.y}%`}
                      x2={`${leftNode.x}%`}
                      y2={`${leftNode.y}%`}
                      stroke="#475569"
                      strokeWidth="2"
                    />
                  );
                }
                if (node.right !== null && node.right !== undefined && nodeMap.has(node.right)) {
                  const rightNode = nodeMap.get(node.right);
                  lines.push(
                    <line
                      key={`${node.val}-right`}
                      x1={`${node.x}%`}
                      y1={`${node.y}%`}
                      x2={`${rightNode.x}%`}
                      y2={`${rightNode.y}%`}
                      stroke="#475569"
                      strokeWidth="2"
                    />
                  );
                }
                return lines;
              })}
            </svg>

            {/* Render Nodes */}
            {nodes.map((node) => {
              const isActive = node.val === activeVal;
              const isCompared = node.val === comparedVal;
              const showBF = structId === 'avl' && node.bf !== undefined;
              
              return (
                <div
                  key={node.val}
                  style={{
                    position: 'absolute',
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="flex flex-col items-center z-10"
                >
                  <div className={`w-11 h-11 rounded-full border-2 font-mono text-sm font-bold flex items-center justify-center shadow-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-4 ring-amber-400/20 scale-110 shadow-amber-400/30'
                      : isCompared
                      ? 'bg-purple-600/30 border-purple-400 text-purple-200 animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-white'
                  }`}>
                    {node.val}
                  </div>
                  <div className="flex items-center space-x-1 mt-1 leading-none">
                    {node.parent !== undefined && (
                      <span className="text-[8px] font-mono font-bold px-1 rounded bg-slate-900/90 border border-slate-800 text-purple-300">
                        P: {node.parent !== null ? node.parent : '∅'}
                      </span>
                    )}
                    {showBF && (
                      <span className={`text-[8px] font-mono font-bold px-1 rounded ${
                        Math.abs(node.bf) > 1 
                          ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40' 
                          : 'bg-slate-900/90 border border-slate-800 text-slate-400'
                      }`}>
                        BF: {node.bf}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {state.rotationLabel && (
              <div className="absolute top-2 left-2 px-3 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-full font-mono font-bold uppercase tracking-wider animate-bounce">
                {state.rotationLabel}
              </div>
            )}
          </div>
        );
      }

      case 'graph': {
        const nodes = state.nodes ?? [];
        const visited = state.visited ?? [];
        const queueStack = state.queueStack ?? [];
        const activeNode = state.activeNode ?? null;
        
        const nodeMap = new Map(nodes.map(n => [n.id, n]));
        
        return (
          <div className="flex flex-col space-y-4 w-full">
            <div className="relative w-full min-h-[260px] p-4">
              {/* SVG Edges */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                {nodes.map((node) => 
                  node.neighbors.map((nbrId) => {
                    const nbr = nodeMap.get(nbrId);
                    if (!nbr) return null;
                    // Draw only one connection line (to prevent double rendering)
                    if (node.id < nbrId) {
                      const isEdgeActive = (node.id === activeNode && visited.includes(nbrId)) || 
                                           (nbrId === activeNode && visited.includes(node.id));
                      return (
                        <line
                          key={`${node.id}-${nbrId}`}
                          x1={`${node.x}%`}
                          y1={`${node.y}%`}
                          x2={`${nbr.x}%`}
                          y2={`${nbr.y}%`}
                          stroke={isEdgeActive ? '#eab308' : '#334155'}
                          strokeWidth={isEdgeActive ? '3' : '2'}
                          className="transition-colors duration-300"
                        />
                      );
                    }
                    return null;
                  })
                )}
              </svg>

              {/* Render Vertices */}
              {nodes.map((node) => {
                const isActive = node.id === activeNode;
                const isVisited = visited.includes(node.id);
                const isInQueue = queueStack.includes(node.id);

                return (
                  <div
                    key={node.id}
                    style={{
                      position: 'absolute',
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="z-10"
                  >
                    <div className={`w-11 h-11 rounded-full border-2 font-mono text-sm font-bold flex items-center justify-center shadow-lg transition-all duration-300 ${
                      isActive 
                        ? 'bg-amber-500/25 border-amber-400 text-amber-300 ring-4 ring-amber-400/25 scale-110 shadow-amber-400/30'
                        : isVisited
                        ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                        : isInQueue
                        ? 'bg-purple-600/20 border-purple-500/60 text-purple-300'
                        : 'bg-slate-800 border-slate-700 text-white'
                    }`}>
                      {node.id}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Queue/Stack HUD */}
            <div className="grid grid-cols-2 gap-4 w-full text-xs font-mono">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="block text-gray-500 font-bold uppercase mb-1">Visited Set</span>
                <span className="text-emerald-400 tracking-wider">
                  {visited.length > 0 ? `{ ${visited.join(', ')} }` : '∅ (Empty)'}
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="block text-gray-500 font-bold uppercase mb-1">
                  {state.mode === 'DFS' ? 'Call Stack' : 'FIFO Queue'}
                </span>
                <span className="text-purple-400 tracking-wider">
                  {queueStack.length > 0 ? `[ ${queueStack.join(' ➔ ')} ]` : '∅ (Empty)'}
                </span>
              </div>
            </div>
          </div>
        );
      }

      // ================= HASH-BASED =================
      case 'hash_table':
      case 'hash_set': {
        const buckets = state.buckets ?? [];
        const activeBucketIdx = state.activeBucketIdx ?? -1;
        const isSet = structId === 'hash_set';

        return (
          <div className="flex flex-col items-stretch p-4 space-y-4 w-full">
            <h4 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider text-center">
              Bucket Array Index (Hash Address ➔ Nodes)
            </h4>
            <div className="space-y-3 bg-slate-900/40 p-4 border border-slate-800 rounded-2xl shadow-xl">
              {buckets.map((bkt) => {
                const isActive = bkt.index === activeBucketIdx;
                const items = isSet ? bkt.keys : bkt.values;

                return (
                  <div key={bkt.index} className="flex items-center">
                    {/* Bucket Slot */}
                    <div className={`w-12 py-2 text-center rounded-lg font-mono font-semibold text-xs border transition-all duration-300 shrink-0 ${
                      isActive 
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold scale-105' 
                        : 'bg-slate-800 border-slate-700 text-gray-400'
                    }`}>
                      [{bkt.index}]
                    </div>

                    {/* Arrow Divider */}
                    <div className="w-8 flex justify-center text-slate-600 text-sm font-mono shrink-0">➔</div>

                    {/* Nodes Chained */}
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {items.length === 0 ? (
                        <span className="text-[10px] text-gray-600 font-mono italic">Ø</span>
                      ) : (
                        items.map((item, idx) => (
                          <React.Fragment key={idx}>
                            <div className="px-3 py-1.5 bg-slate-800/90 border border-slate-700 rounded-lg text-xs font-mono text-white shadow-sm flex items-center shrink-0">
                              {item}
                            </div>
                            {idx < items.length - 1 && (
                              <span className="text-gray-500 text-xs shrink-0">➔</span>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'linear_search':
      case 'binary_search': {
        const targetType = state.structureType ?? 'array1d';
        let mappedId = targetType;
        if (targetType === 'tree') mappedId = 'bst';
        return renderContent(mappedId, state);
      }

      case 'bubble_sort':
      case 'selection_sort':
      case 'insertion_sort':
      case 'merge_sort':
      case 'quick_sort': {
        const arr = state.arr ?? [];
        const activeIdx1 = state.activeIdx1 ?? -1;
        const activeIdx2 = state.activeIdx2 ?? -1;
        const sortedIdx = state.sortedIdx ?? -1;
        const pivotIdx = state.pivotIdx ?? -1;
        const minIdx = state.minIdx ?? -1;
        const keyVal = state.keyVal ?? null;
        
        const maxVal = Math.max(...arr, 1);
        const isFullySorted = state.label === 'Fully sorted' || state.label === 'Fully sorted!';
        
        return (
          <div className="flex flex-col items-center p-6 space-y-6 w-full max-w-xl mx-auto">
            {/* Bars container */}
            <div className="flex items-end justify-center w-full h-[200px] gap-2.5 px-4 border-b border-slate-850">
              {arr.map((val, idx) => {
                const heightPercent = Math.max((val / maxVal) * 100, 15);
                
                // Determine bar color and styles
                let barColorClass = 'bg-slate-800/80 border-slate-700 text-slate-300';
                let animateClass = '';
                let borderStyle = 'border-2';
                
                // 1. Pivot
                if (idx === pivotIdx) {
                  barColorClass = 'bg-purple-600/80 border-purple-400 text-purple-200 shadow-md shadow-purple-500/20';
                  animateClass = 'scale-105';
                }
                // 2. Minimum
                else if (idx === minIdx) {
                  barColorClass = 'bg-cyan-600/80 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20';
                  animateClass = 'scale-105';
                }
                // 3. Compared/Swapped
                else if (idx === activeIdx1 || idx === activeIdx2) {
                  const isSwap = state.label && (state.label.toLowerCase().includes('swap') || state.label.toLowerCase().includes('write') || state.label.toLowerCase().includes('place'));
                  if (isSwap) {
                    barColorClass = 'bg-rose-500/80 border-rose-400 text-rose-100 shadow-lg shadow-rose-500/30';
                  } else {
                    barColorClass = 'bg-amber-500/85 border-amber-400 text-amber-900 shadow-lg shadow-amber-500/30';
                  }
                  animateClass = 'scale-105 animate-pulse';
                }
                // 4. Sorted segment
                else {
                  let isSorted = isFullySorted;
                  if (structId === 'bubble_sort' && sortedIdx !== -1) {
                    isSorted = idx >= sortedIdx;
                  } else if ((structId === 'selection_sort' || structId === 'insertion_sort') && sortedIdx !== -1) {
                    isSorted = idx <= sortedIdx;
                  }
                  
                  if (isSorted) {
                    barColorClass = 'bg-emerald-600/60 border-emerald-500 text-emerald-200';
                  }
                }
                
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 max-w-[50px] transition-all duration-300">
                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg flex items-end justify-center pb-2 font-mono font-bold text-sm transition-all duration-350 shadow-inner border-t-2 ${borderStyle} ${barColorClass} ${animateClass}`}
                    >
                      <span className="select-none">{val}</span>
                    </div>
                    {/* Index label below */}
                    <span className="text-[10px] text-gray-500 font-mono mt-1 select-none">[{idx}]</span>
                  </div>
                );
              })}
            </div>
            
            {/* Additional state displays (e.g. Pivot value, Key value) */}
            <div className="flex flex-wrap gap-4 text-xs font-mono justify-center">
              {pivotIdx !== -1 && (
                <div className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/25 text-purple-300 rounded select-none">
                  Pivot: <span className="font-bold">{arr[pivotIdx]}</span>
                </div>
              )}
              {minIdx !== -1 && (
                <div className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 rounded select-none">
                  Min Index: <span className="font-bold">{minIdx}</span> (val: {arr[minIdx]})
                </div>
              )}
              {keyVal !== null && (
                <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/25 text-amber-300 rounded select-none">
                  Key: <span className="font-bold">{keyVal}</span>
                </div>
              )}
              {state.label && (
                <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-yellow-300 font-semibold uppercase tracking-wider select-none">
                  {state.label}
                </div>
              )}
            </div>
          </div>
        );
      }

      default:
        return <div className="text-gray-400">Renderer not defined for {structureId}.</div>;
    }
  };

  const cursorClass = isDragging ? 'cursor-grabbing' : 'cursor-grab';

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        backgroundImage: 'radial-gradient(rgba(168, 85, 247, 0.08) 1.5px, transparent 1.5px)',
        backgroundSize: '16px 16px',
      }}
      className={`w-full flex items-center justify-center p-4 bg-slate-900/35 border border-slate-800/50 rounded-3xl min-h-[300px] shadow-inner select-none relative overflow-hidden ${cursorClass}`}
    >
      {/* Impossible Operation Alert Banner */}
      {stepStatus === 'fail' && currentStep?.description && (
        <div className="absolute top-3 left-3 flex items-center space-x-2 bg-rose-950/80 border border-rose-500/40 rounded-xl px-3 py-1.5 z-30 shadow-lg backdrop-blur-md animate-bounce max-w-[70%]">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
          <span className="text-[10px] sm:text-xs font-semibold text-rose-300 font-mono tracking-wide">
            {currentStep.description}
          </span>
        </div>
      )}

      {/* Zoom / Pan HUD */}
      <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-slate-950/80 border border-slate-800 rounded-xl p-1.5 z-30 shadow-lg backdrop-blur-sm select-none">
        <button
          onClick={(e) => { e.stopPropagation(); setScale(prev => Math.min(prev + 0.1, 3.0)); }}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors text-xs font-bold w-6 h-6 flex items-center justify-center cursor-pointer"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setScale(prev => Math.max(prev - 0.1, 0.4)); }}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors text-xs font-bold w-6 h-6 flex items-center justify-center cursor-pointer"
          title="Zoom Out"
        >
          -
        </button>
        <div className="w-[1px] h-4 bg-slate-800" />
        <button
          onClick={(e) => { e.stopPropagation(); resetViewport(); }}
          className="px-2 py-1 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-white rounded font-mono font-bold transition-colors cursor-pointer"
          title="Reset Zoom & Pan"
        >
          RESET VIEW
        </button>
      </div>

      <div 
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
        className="w-full h-full flex items-center justify-center pointer-events-auto"
      >
        {renderContent()}
      </div>
    </div>
  );
}
