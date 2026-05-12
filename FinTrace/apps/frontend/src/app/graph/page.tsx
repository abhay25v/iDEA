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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <NavBar showNav title="FinTrace" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Transaction Network Visualization</h2>
          <p className="text-slate-400">Analyze account relationships, money trails, and fraud patterns in the transaction network.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Graph Container */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Network Graph</CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={containerRef} className="w-full h-96 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-center">
                  {loadingGraph ? (
                    <p className="text-slate-400">Loading network...</p>
                  ) : graphData.nodes.length > 0 ? (
                    <div className="w-full h-full relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-800 to-slate-900">
                      {/* Simplified node visualization */}
                      <svg className="w-full h-full" style={{ pointerEvents: 'auto' }}>
                        {/* Draw edges */}
                        {graphData.edges.map((edge) => {
                          const sourceNode = graphData.nodes.find((n) => n.data.id === edge.data.source);
                          const targetNode = graphData.nodes.find((n) => n.data.id === edge.data.target);

                          const sourceIdx = graphData.nodes.indexOf(sourceNode!);
                          const targetIdx = graphData.nodes.indexOf(targetNode!);

                          const sourceX = 50 + (sourceIdx % 3) * 150;
                          const sourceY = 50 + Math.floor(sourceIdx / 3) * 120;
                          const targetX = 50 + (targetIdx % 3) * 150;
                          const targetY = 50 + Math.floor(targetIdx / 3) * 120;

                          return (
                            <line
                              key={edge.data.id}
                              x1={sourceX}
                              y1={sourceY}
                              x2={targetX}
                              y2={targetY}
                              stroke="#475569"
                              strokeWidth="2"
                              markerEnd="url(#arrowhead)"
                            />
                          );
                        })}

                        {/* Arrow marker definition */}
                        <defs>
                          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                            <polygon points="0 0, 10 3, 0 6" fill="#475569" />
                          </marker>
                        </defs>

                        {/* Draw nodes */}
                        {graphData.nodes.map((node, idx) => {
                          const x = 50 + (idx % 3) * 150;
                          const y = 50 + Math.floor(idx / 3) * 120;
                          const risk = node.data.risk || 0;
                          const riskColor =
                            risk > 0.7 ? '#ef4444' : risk > 0.5 ? '#f59e0b' : risk > 0.3 ? '#eab308' : '#22c55e';

                          return (
                            <g key={node.data.id} onClick={() => setSelectedNode(node.data.id)} style={{ cursor: 'pointer' }}>
                              <circle cx={x} cy={y} r="25" fill={riskColor} opacity={selectedNode === node.data.id ? 1 : 0.8} />
                              <text x={x} y={y} textAnchor="middle" dy="0.3em" fill="white" fontSize="12" fontWeight="bold">
                                {node.data.id.split('_')[1]}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  ) : (
                    <p className="text-slate-400">No network data available.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls & Legend */}
          <div className="lg:col-span-1 space-y-4">
            {/* Risk Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Risk Levels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-slate-300">Critical (0.7+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span className="text-slate-300">High (0.5-0.7)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span className="text-slate-300">Medium (0.3-0.5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-slate-300">Low (&lt;0.3)</span>
                </div>
              </CardContent>
            </Card>

            {/* Node Details */}
            {selectedNode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {(() => {
                    const node = graphData.nodes.find((n) => n.data.id === selectedNode);
                    return node ? (
                      <>
                        <p>
                          <span className="text-slate-400">ID:</span> {node.data.id}
                        </p>
                        <p>
                          <span className="text-slate-400">Risk:</span> {((node.data.risk || 0) * 100).toFixed(0)}%
                        </p>
                        <p>
                          <span className="text-slate-400">Status:</span> <span className="text-green-300">Active</span>
                        </p>
                      </>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button className="w-full px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm transition">
                  Zoom In
                </button>
                <button className="w-full px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm transition">
                  Zoom Out
                </button>
                <button className="w-full px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm transition">
                  Reset View
                </button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Network Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent>
              <div className="pt-4">
                <p className="text-slate-400 text-sm mb-1">Total Accounts</p>
                <p className="text-2xl font-bold text-white">{graphData.nodes.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="pt-4">
                <p className="text-slate-400 text-sm mb-1">Total Connections</p>
                <p className="text-2xl font-bold text-white">{graphData.edges.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="pt-4">
                <p className="text-slate-400 text-sm mb-1">High Risk Nodes</p>
                <p className="text-2xl font-bold text-red-400">
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
