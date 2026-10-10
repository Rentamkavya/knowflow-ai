import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Orbit, 
  Search, 
  Filter, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  BookOpen, 
  FileText, 
  Layers, 
  MessageSquare, 
  Eye, 
  Move, 
  Play, 
  Pause, 
  Maximize2 
} from 'lucide-react';

export default function KnowledgeGalaxy({ onAskPrompt, onInspectDocument }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [galaxyData, setGalaxyData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);

  // Fetch galaxy nodes from API
  const fetchGalaxyData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/galaxy', {
        headers: { 'x-workspace-id': 'knowflow-enterprise-demo' }
      });
      const data = await res.json();
      
      const categoryAngles = {
        HR: 0,
        Finance: (1 / 5) * Math.PI * 2,
        IT: (2 / 5) * Math.PI * 2,
        Engineering: (3 / 5) * Math.PI * 2,
        Product: (4 / 5) * Math.PI * 2
      };

      // Layout nodes into orbital hierarchy
      const nodesWithPos = (data.nodes || []).map((node, i, arr) => {
        let radius = 0;
        let baseAngle = (i / arr.length) * Math.PI * 2;

        if (node.type === 'root') {
          radius = 0;
          baseAngle = 0;
        } else if (node.type === 'category') {
          radius = 160;
          baseAngle = categoryAngles[node.category] ?? baseAngle;
        } else if (node.type === 'document') {
          radius = 280 + ((i % 3) * 35);
          const parentCatAngle = categoryAngles[node.category] ?? baseAngle;
          baseAngle = parentCatAngle + ((i % 5) - 2) * 0.22;
        } else {
          // chunk node
          radius = 380 + ((i % 4) * 25);
          const parentCatAngle = categoryAngles[node.category] ?? baseAngle;
          baseAngle = parentCatAngle + ((i % 7) - 3) * 0.15;
        }

        return {
          ...node,
          x: Math.cos(baseAngle) * radius,
          y: Math.sin(baseAngle) * radius,
          baseAngle,
          currentAngle: baseAngle,
          radius,
          color: node.type === 'root' ? '#8B5CF6' :
                 node.type === 'category' ? (node.color || '#EC4899') :
                 node.type === 'document' ? '#22D3EE' : '#94A3B8'
        };
      });

      setGalaxyData({ nodes: nodesWithPos, links: data.links || [] });
    } catch (err) {
      console.error('[Galaxy Fetch Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalaxyData();
  }, []);

  // Center / reset camera
  const handleResetCamera = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  // Canvas Mouse Interaction (Pan & Zoom)
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    // Hover detection
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = canvas.width / 2 + pan.x;
    const centerY = canvas.height / 2 + pan.y;

    const graphX = (mouseX - centerX) / zoom;
    const graphY = (mouseY - centerY) / zoom;

    const found = galaxyData.nodes.find(node => {
      const matchesCat = selectedCategory === 'All' || node.category === selectedCategory || node.type === 'root';
      if (!matchesCat) return false;
      const dx = node.x - graphX;
      const dy = node.y - graphY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist <= (node.size || 15) + 6;
    });

    setHoveredNode(found || null);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.4), 3.0));
  };

  // Node Selection on Click
  const handleCanvasClick = (e) => {
    if (hoveredNode) {
      setSelectedNode(hoveredNode);
    }
  };

  // Canvas Animation Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || galaxyData.nodes.length === 0) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let time = 0;

    const render = () => {
      if (autoRotate) time += 0.003;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2 + pan.x;
      const centerY = canvas.height / 2 + pan.y;

      // Filter nodes
      const filteredNodes = galaxyData.nodes.filter(node => {
        const matchesCat = selectedCategory === 'All' || node.category === selectedCategory || node.type === 'root';
        const matchesSearch = !searchQuery || (node.label && node.label.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCat && matchesSearch;
      });

      const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(zoom, zoom);

      // 1. Draw Orbit Ring Guides
      [160, 290, 395].forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 0 ? 'rgba(139, 92, 246, 0.12)' : idx === 1 ? 'rgba(34, 211, 238, 0.08)' : 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 2. Draw Connection Links
      galaxyData.links.forEach(link => {
        const sourceNode = galaxyData.nodes.find(n => n.id === link.source);
        const targetNode = galaxyData.nodes.find(n => n.id === link.target);

        if (sourceNode && targetNode && filteredNodeIds.has(sourceNode.id) && filteredNodeIds.has(targetNode.id)) {
          const isConnectedToSelected = selectedNode && (selectedNode.id === sourceNode.id || selectedNode.id === targetNode.id);
          const isConnectedToHovered = hoveredNode && (hoveredNode.id === sourceNode.id || hoveredNode.id === targetNode.id);

          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);

          if (isConnectedToSelected || isConnectedToHovered) {
            ctx.strokeStyle = '#22D3EE';
            ctx.lineWidth = 2.2;
            ctx.shadowColor = '#22D3EE';
            ctx.shadowBlur = 8;
          } else {
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.18)';
            ctx.lineWidth = 1;
            ctx.shadowBlur = 0;
          }
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Flowing particle pulse along active link
          const pulseProgress = (time * 1.6 + (sourceNode.radius || 0) * 0.02) % 1;
          const px = sourceNode.x + (targetNode.x - sourceNode.x) * pulseProgress;
          const py = sourceNode.y + (targetNode.y - sourceNode.y) * pulseProgress;

          ctx.beginPath();
          ctx.arc(px, py, isConnectedToSelected ? 2.5 : 1.5, 0, Math.PI * 2);
          ctx.fillStyle = isConnectedToSelected ? '#22D3EE' : 'rgba(139, 92, 246, 0.6)';
          ctx.fill();
        }
      });

      // 3. Update Positions & Render Nodes
      filteredNodes.forEach(node => {
        // Slow rotation around root
        if (autoRotate && node.radius > 0) {
          const rotationSpeed = node.type === 'category' ? 0.35 : node.type === 'document' ? 0.2 : 0.12;
          node.currentAngle = node.baseAngle + (time * rotationSpeed);
          node.x = Math.cos(node.currentAngle) * node.radius;
          node.y = Math.sin(node.currentAngle) * node.radius;
        }

        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const isMatchedSearch = searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
        const size = node.size || 15;

        // Outer Aura
        if (isSelected || isHovered || isMatchedSearch) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 10, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(34, 211, 238, 0.3)';
          ctx.fill();
        }

        // Mid Glow Ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 4, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}33`;
        ctx.fill();

        // Main Node Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isSelected ? 25 : isHovered ? 18 : 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Clean border ring
        ctx.strokeStyle = isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.stroke();

        // Node Label
        ctx.font = node.type === 'root' ? 'bold 13px Inter' :
                   node.type === 'category' ? 'bold 12px Inter' :
                   node.type === 'document' ? '600 11px Inter' : '500 10px Inter';
        
        ctx.fillStyle = isSelected ? '#22D3EE' : isHovered ? '#FFFFFF' : '#CBD5E1';
        ctx.textAlign = 'center';

        const labelText = node.label.length > 24 ? node.label.slice(0, 22) + '...' : node.label;
        ctx.fillText(labelText, node.x, node.y + size + 15);
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [galaxyData, selectedCategory, searchQuery, selectedNode, hoveredNode, zoom, pan, autoRotate]);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header & Graph Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <Orbit className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Knowledge Graph Explorer
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time interactive constellation mapping documents, topics, and vector chunk relationships
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Node Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search graph nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded-xl text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            {['All', 'HR', 'Finance', 'IT', 'Engineering', 'Product'].map(cat => (
              <option key={cat} value={cat}>Filter: {cat}</option>
            ))}
          </select>

          {/* Camera Controls */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-white/[0.08] rounded-xl p-1">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.25, 3.0))}
              className="p-1 text-slate-400 hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.4))}
              className="p-1 text-slate-400 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetCamera}
              className="p-1 text-slate-400 hover:text-cyan-400 transition"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-1 transition ${autoRotate ? 'text-cyan-400' : 'text-slate-500'}`}
              title={autoRotate ? 'Pause Orbit' : 'Resume Orbit'}
            >
              {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={fetchGalaxyData}
              className="p-1 text-slate-400 hover:text-cyan-400 transition"
              title="Reload Graph"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph Viewport */}
      <div 
        ref={containerRef}
        className="relative h-[640px] glass-panel rounded-3xl border border-indigo-500/30 overflow-hidden flex items-center justify-center bg-[#070B16] shadow-2xl select-none"
      >
        {/* Ambient starfield background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-40 pointer-events-none" />

        <canvas
          ref={canvasRef}
          width={1100}
          height={640}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-grab active:cursor-grabbing z-10"
        />

        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 p-3.5 rounded-2xl glass-panel bg-[#0E1528]/85 border border-white/[0.08] text-[11px] space-y-2 z-20 pointer-events-none shadow-xl">
          <p className="font-bold text-white text-xs">Constellation Node Types:</p>
          <div className="space-y-1.5 text-slate-300">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-xs shadow-violet-500" />
              <span>KnowFlow System Hub</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-xs shadow-pink-500" />
              <span>Department Hubs (HR/Finance/IT/Eng)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400" />
              <span>Document Nodes</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Vector Chunk Snippets</span>
            </div>
          </div>
        </div>

        {/* Navigation Pan Helper */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/[0.08] text-[11px] text-slate-400 flex items-center space-x-2 z-20 pointer-events-none">
          <Move className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click & drag to pan • Scroll to zoom • Click node to inspect</span>
        </div>

        {/* Hovered Node Tooltip */}
        {hoveredNode && !selectedNode && (
          <div 
            className="absolute top-4 right-4 p-3 rounded-xl glass-panel-glow bg-[#0E1528]/95 border border-cyan-400/50 text-xs z-30 pointer-events-none animate-fadeIn"
          >
            <span className="text-[10px] font-bold uppercase text-cyan-400">{hoveredNode.type} Node</span>
            <p className="font-bold text-white mt-0.5">{hoveredNode.label}</p>
            <p className="text-[10px] text-slate-400">Click node for deep inspection</p>
          </div>
        )}

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute bottom-4 right-4 w-84 sm:w-96 p-5 rounded-2xl glass-panel-glow bg-[#0E1528]/95 border border-cyan-400/60 text-xs space-y-3.5 z-30 animate-scaleIn shadow-2xl">
            
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-cyan-300 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                {selectedNode.type} Node Selected
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="font-extrabold text-white text-base leading-snug">{selectedNode.label}</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Category Domain: <strong className="text-slate-200">{selectedNode.category || 'General'}</strong></p>
            </div>

            {selectedNode.snippet && (
              <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-200 border border-white/[0.06] leading-relaxed">
                "{selectedNode.snippet}"
              </div>
            )}

            {selectedNode.docCount !== undefined && (
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/[0.06] text-slate-300 flex items-center justify-between">
                <span>Associated Documents:</span>
                <strong className="text-cyan-400 font-bold">{selectedNode.docCount} Docs</strong>
              </div>
            )}

            {selectedNode.pageCount !== undefined && (
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900 border border-white/[0.06]">
                <div>
                  <span className="text-[10px] text-slate-400 block">Pages:</span>
                  <strong className="text-white">{selectedNode.pageCount} Pages</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Chunks:</span>
                  <strong className="text-cyan-400">{selectedNode.chunkCount || 0} Chunks</strong>
                </div>
              </div>
            )}

            {/* Actions for selected node */}
            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  const prompt = selectedNode.type === 'document' 
                    ? `Summarize the key policies and requirements from ${selectedNode.label}.`
                    : `Explain the key concepts related to ${selectedNode.label} in our company.`;
                  onAskPrompt(prompt);
                }}
                className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white transition text-xs shadow-md shadow-indigo-600/20"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask AI About This</span>
              </button>

              {selectedNode.type === 'document' && onInspectDocument && (
                <button
                  onClick={() => onInspectDocument(selectedNode.id.replace('doc-', ''))}
                  className="px-3 py-2 rounded-xl font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] transition text-xs"
                  title="Inspect Document"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
