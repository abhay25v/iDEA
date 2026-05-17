// Graph Visualization Page - Network Analysis

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { NavBar, Card, CardHeader, CardTitle, CardContent } from '@/components';

// Cytoscape types
interface GraphNode {
  data: {
    id: string;
    label: string;
    risk?: number;
  };
  classes?: string;
}

interface GraphEdge {
  data: {
    id: string;
    source: string;
    target: string;
    weight?: number;
  };
  classes?: string;
}

export default function GraphVisualizationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] }>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [loadingGraph, setLoadingGraph] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!mounted || loading || !user) {
      return;
    }

    void loadGraphData();
  }, [mounted, loading, user]);

  const loadGraphData = async () => {
    try {
      setLoadingGraph(true);

      // Simulated graph data - In production, would fetch from backend Neo4j
      const mockData: { nodes: GraphNode[]; edges: GraphEdge[] } = {
        nodes: [
          { data: { id: 'ACC_001', label: 'ACC_001', risk: 0.45 } },
          { data: { id: 'ACC_002', label: 'ACC_002', risk: 0.82 } },
          { data: { id: 'ACC_003', label: 'ACC_003', risk: 0.35 } },
          { data: { id: 'ACC_004', label: 'ACC_004', risk: 0.91 } },
          { data: { id: 'ACC_005', label: 'ACC_005', risk: 0.28 } },
          { data: { id: 'ACC_006', label: 'ACC_006', risk: 0.72 } },
        ],
        edges: [
          { data: { id: 'txn1', source: 'ACC_001', target: 'ACC_002', weight: 5000 } },
          { data: { id: 'txn2', source: 'ACC_002', target: 'ACC_003', weight: 3000 } },
          { data: { id: 'txn3', source: 'ACC_003', target: 'ACC_004', weight: 8000 } },
          { data: { id: 'txn4', source: 'ACC_004', target: 'ACC_005', weight: 2000 } },
          { data: { id: 'txn5', source: 'ACC_005', target: 'ACC_001', weight: 5000 } },
          { data: { id: 'txn6', source: 'ACC_002', target: 'ACC_006', weight: 4500 } },
        ],
      };

      setGraphData(mockData);
    } catch (error) {
      console.error('Failed to load graph data:', error);
    } finally {
      setLoadingGraph(false);
    }
  };

  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <NavBar showNav title="FinTrace" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-2">Transaction Network Visualization</h2>
          <p className="text-slate-600 text-lg">Visualize account relationships and monitor fraud patterns across your network.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Graph Container */}
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Network Topology</CardTitle>
                <p className="text-slate-600 text-sm mt-2 font-medium">Click nodes to view account details and risk analysis</p>
              </CardHeader>
              <CardContent>
                <div ref={containerRef} className="w-full h-[600px] rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-300 flex items-center justify-center shadow-inner">
                  {loadingGraph ? (
                    <p className="text-slate-600 font-medium">Loading network...</p>
                  ) : graphData.nodes.length > 0 ? (
                    <div className="w-full h-full relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                      {/* Simplified node visualization */}
                      {(() => {
                        const width = 700;
                        const height = 600;
                        const count = graphData.nodes.length || 1;
                        const cols = Math.ceil(Math.sqrt(count));
                        const rows = Math.ceil(count / cols);
                        const spacingX = width / (cols + 1);
                        const spacingY = height / (rows + 1);

                        const positions = graphData.nodes.map((_, idx) => {
                          const col = idx % cols;
                          const row = Math.floor(idx / cols);
                          return {
                            x: Math.round(spacingX * (col + 1)),
                            y: Math.round(spacingY * (row + 1)),
                          };
                        });

                        return (
                          <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full" style={{ pointerEvents: 'auto' }}>
                            {/* Curved edges (quadratic Bezier) */}
                            <defs>
                              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                <polygon points="0 0, 10 3, 0 6" fill="#cbd5e1" />
                              </marker>
                            </defs>

                            {graphData.edges.map((edge) => {
                              const sourceNode = graphData.nodes.find((n) => n.data.id === edge.data.source);
                              const targetNode = graphData.nodes.find((n) => n.data.id === edge.data.target);
                              if (!sourceNode || !targetNode) return null;

                              const sourceIdx = graphData.nodes.indexOf(sourceNode);
                              const targetIdx = graphData.nodes.indexOf(targetNode);
                              const s = positions[sourceIdx];
                              const t = positions[targetIdx];

                              const dx = t.x - s.x;
                              const dy = t.y - s.y;
                              // perpendicular offset for curve control point
                              const offset = Math.sqrt(dx * dx + dy * dy) * 0.18;
                              const cx = (s.x + t.x) / 2 + (dy / Math.hypot(dx || 1, dy || 1)) * offset;
                              const cy = (s.y + t.y) / 2 - (dx / Math.hypot(dx || 1, dy || 1)) * offset;

                              const d = `M ${s.x} ${s.y} Q ${cx} ${cy} ${t.x} ${t.y}`;

                              return (
                                <path key={edge.data.id} d={d} fill="none" stroke="#cbd5e1" strokeWidth={2} markerEnd="url(#arrowhead)" strokeLinecap="round" />
                              );
                            })}

                            {/* Draw nodes */}
                            {graphData.nodes.map((node, idx) => {
                              const pos = positions[idx];
                              const risk = node.data.risk || 0;
                              const riskColor = risk > 0.7 ? '#ef4444' : risk > 0.5 ? '#f59e0b' : risk > 0.3 ? '#eab308' : '#22c55e';

                              return (
                                <g key={node.data.id} onClick={() => setSelectedNode(node.data.id)} style={{ cursor: 'pointer' }}>
                                  <circle cx={pos.x} cy={pos.y} r={26} fill={riskColor} opacity={selectedNode === node.data.id ? 1 : 0.95} />
                                  <text x={pos.x} y={pos.y} textAnchor="middle" dy="0.35em" fill="#ffffff" fontSize={12} fontWeight="700">
                                    {node.data.id.split('_')[1]}
                                  </text>
                                </g>
                              );
                            })}
                          </svg>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="text-slate-600 font-medium">No network data available.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls & Legend */}
          <div className="lg:col-span-1 space-y-4">
            {/* Risk Legend */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm">Risk Levels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-slate-700 font-medium">Critical (0.7+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span className="text-slate-700 font-medium">High (0.5-0.7)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span className="text-slate-700 font-medium">Medium (0.3-0.5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-slate-700 font-medium">Low (&lt;0.3)</span>
                </div>
              </CardContent>
            </Card>

            {/* Node Details */}
            {selectedNode && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-sm">Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {(() => {
                    const node = graphData.nodes.find((n) => n.data.id === selectedNode);
                    return node ? (
                      <>
                        <p>
                          <span className="text-slate-600 font-medium">ID:</span> <span className="text-slate-900 font-semibold">{node.data.id}</span>
                        </p>
                        <p>
                          <span className="text-slate-600 font-medium">Risk:</span> <span className="text-slate-900 font-semibold">{((node.data.risk || 0) * 100).toFixed(0)}%</span>
                        </p>
                        <p>
                          <span className="text-slate-600 font-medium">Status:</span> <span className="text-emerald-600 font-semibold">Active</span>
                        </p>
                      </>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Controls */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm">Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button className="w-full px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition">
                  Zoom In
                </button>
                <button className="w-full px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition">
                  Zoom Out
                </button>
                <button className="w-full px-3 py-2 rounded bg-slate-200 hover:bg-slate-300 text-slate-900 text-sm font-medium transition">
                  Reset View
                </button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Network Statistics */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Network Overview</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-gradient-to-br from-white to-blue-50 shadow-md">
            <CardContent>
              <div className="pt-4">
                <p className="text-slate-600 text-sm font-bold uppercase tracking-wide">Total Accounts</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{graphData.nodes.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-white to-indigo-50 shadow-md">
            <CardContent>
              <div className="pt-4">
                <p className="text-slate-600 text-sm font-bold uppercase tracking-wide">Total Connections</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{graphData.edges.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-white to-red-50 shadow-md">
            <CardContent>
              <div className="pt-4">
                <p className="text-slate-600 text-sm font-bold uppercase tracking-wide">High Risk Nodes</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {graphData.nodes.filter((n) => (n.data.risk || 0) > 0.7).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
