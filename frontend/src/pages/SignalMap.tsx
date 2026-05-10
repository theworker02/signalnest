import "@xyflow/react/dist/style.css";
import { Background, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState, type Edge, type Node } from "@xyflow/react";
import { Network, Plus, RotateCcw, ZoomIn } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/Button";
import { PageIntro } from "../components/PageIntro";
import { useAppStore } from "../stores/useAppStore";

const nodeLabelStyle = { color: "#05070c", fontWeight: 700 };

const nodes: Node[] = [
  { id: "signalnest", position: { x: 340, y: 120 }, data: { label: "SignalNest" }, type: "input", style: nodeLabelStyle },
  { id: "arc", position: { x: 120, y: 40 }, data: { label: "Arc Browser" }, style: nodeLabelStyle },
  { id: "vercel", position: { x: 95, y: 220 }, data: { label: "Vercel" }, style: nodeLabelStyle },
  { id: "cdn", position: { x: 580, y: 60 }, data: { label: "CDN Outage" }, style: nodeLabelStyle },
  { id: "reddit", position: { x: 620, y: 230 }, data: { label: "Communities" }, style: nodeLabelStyle },
  { id: "weather", position: { x: 355, y: 330 }, data: { label: "Weather Alerts" }, style: nodeLabelStyle },
  { id: "pricing", position: { x: 345, y: -40 }, data: { label: "Pricing Diffs" }, style: nodeLabelStyle },
];

const edges: Edge[] = [
  { id: "e1", source: "signalnest", target: "arc", animated: true },
  { id: "e2", source: "signalnest", target: "vercel", animated: true },
  { id: "e3", source: "signalnest", target: "cdn", animated: true },
  { id: "e4", source: "signalnest", target: "reddit", animated: true },
  { id: "e5", source: "signalnest", target: "weather", animated: true },
  { id: "e6", source: "arc", target: "pricing", animated: true },
  { id: "e7", source: "vercel", target: "cdn", animated: true },
];

export function SignalMap() {
  const trackers = useAppStore((state) => state.trackers).filter((tracker) => !tracker.archived);
  const pushToast = useAppStore((state) => state.pushToast);
  const addActivity = useAppStore((state) => state.addActivity);
  const [graphNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [graphEdges, setEdges, onEdgesChange] = useEdgesState(edges);
  const [selectedTrackerId, setSelectedTrackerId] = useState(trackers[0]?.id ?? "");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const graphHelp = "Use mouse wheel or trackpad to zoom, drag empty canvas to pan, and drag nodes to reorganize clusters.";

  function addTrackerNode() {
    const tracker = trackers.find((item) => item.id === selectedTrackerId);
    if (!tracker || graphNodes.some((node) => node.id === tracker.id)) return;
    const nextNode: Node = {
      id: tracker.id,
      position: { x: 120 + graphNodes.length * 34, y: 360 + (graphNodes.length % 3) * 64 },
      data: { label: tracker.title },
      style: nodeLabelStyle,
    };
    setNodes((current) => [...current, nextNode]);
    setEdges((current) => [...current, { id: `edge-${tracker.id}`, source: "signalnest", target: tracker.id, animated: true }]);
    addActivity(`Mapped signal ${tracker.title}`);
    pushToast({ title: "Signal mapped", body: tracker.title, tone: "success" });
  }

  function resetGraph() {
    setNodes(nodes);
    setEdges(edges);
    setSelectedNode(null);
    pushToast({ title: "Signal map reset", body: "Default clusters restored.", tone: "info" });
  }

  return (
    <div className="grid gap-4">
      <PageIntro
        eyebrow="Signal Map"
        title="Explore how monitored topics relate to each other."
        body="Drag nodes to rearrange clusters. Pan the canvas, zoom with the controls, and use the minimap to keep your place."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              icon={<ZoomIn className="h-4 w-4" />}
              onClick={() => {
                void navigator.clipboard?.writeText(graphHelp);
                pushToast({ title: "Graph controls copied", body: graphHelp, tone: "info" });
              }}
            >
              Copy graph controls
            </Button>
            <Button variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={resetGraph}>Reset map</Button>
          </div>
        }
      />
      <div className="panel flex flex-wrap items-center gap-3 rounded-lg p-4">
        <select value={selectedTrackerId} onChange={(event) => setSelectedTrackerId(event.target.value)} className="min-w-56 rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-cyan/40">
          {trackers.map((tracker) => <option key={tracker.id} value={tracker.id}>{tracker.title}</option>)}
        </select>
        <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={addTrackerNode} disabled={!selectedTrackerId}>Add tracker node</Button>
        {selectedNode && <div className="text-sm text-slate-400">Selected node: <span className="text-white">{String(selectedNode.data.label)}</span></div>}
      </div>
      <div className="panel h-[72vh] overflow-hidden rounded-lg">
        <ReactFlow
          nodes={graphNodes}
          edges={graphEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_, node) => setSelectedNode(node)}
          fitView
          nodesDraggable
          nodesConnectable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="rgba(148,163,184,.18)" gap={28} />
          <Controls />
          <MiniMap pannable zoomable nodeColor={() => "#4ad7ff"} />
        </ReactFlow>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {["Category clustering", "Animated live links", "Zoom and pan navigation"].map((item) => (
          <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <Network className="mb-3 h-4 w-4 text-cyan" />
            <div className="font-bold text-white">{item}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
