import React, { useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
	useNodesState,
	useEdgesState,
	addEdge,
	Connection,
	Edge,
	MiniMap,
	Controls,
	Background,
	BackgroundVariant,
	Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { SummaryNode, KeyPointNode } from '@/components/CustomNodes';
import { KeyPoint, LectureNote } from '@/types/lectureNote';

// Helper function to calculate positions
function calculatePosition(index: number, total: number, startY: number): number {
	const gap = 100; // Vertical gap between nodes
	return startY + (index - (total - 1) / 2) * gap;
}

// Function to generate nodes and edges
function generateGraph(
	node: LectureNote | KeyPoint,
	startX: number = 0,
	startY: number = 0,
	level: number = 0
): { nodes: Node[]; edges: Edge[] } {
	let nodes: Node[] = [];
	let edges: Edge[] = [];

	const x = startX; // Horizontal space between levels
	const y = startY + (level <= 1 ? 200 : 400); // Starting vertical position for root

	// Create the node for the lecture note
	let newNode: Node;
	if (level == 0) {
		newNode = {
			id: `root`,
			type: 'summary',
			position: { x, y: 0 },
			data: { summary: node.summary, logistic: node.logistic },
		};
	} else {
		newNode = {
			id: node.id,
			type: 'keyPoint',
			position: { x, y },
			data: { title: node.title, content: node.content },
		};
	}

	nodes.push(newNode);

	// Recursively handle key points
	node.children?.forEach((child: KeyPoint, index: number) => {
		const n = node.children.length;
		const gap = 600;
		const xOffsets: number[] = [];
		// Calculate the starting value
		let start: number;

		if (n % 2 === 0) {
			// For even n, center around -200 and 200
			start = -(n / 2) * gap + gap / 2;
		} else {
			// For odd n, center around 0
			start = -Math.floor(n / 2) * gap;
		}
		for (let i = 0; i < n; i++) {
			xOffsets.push(start + gap * i);
		}

		const childGraph = generateGraph(child, x + xOffsets[index], y, level + 1);
		nodes = nodes.concat(childGraph.nodes);
		edges = edges.concat(childGraph.edges);

		// Create edge from lecture note to key point
		const edge: Edge = {
			id: `e${newNode.id}-${child.id}`,
			source: newNode.id,
			target: child.id,
		};
		edges.push(edge);
	});

	return { nodes, edges };
}

export const FlowChart = ({ lectureNote }: { lectureNote: LectureNote }) => {
	const { nodes: initialNodes, edges: initialEdges } = generateGraph(lectureNote);
	console.log(initialNodes, initialEdges);

	const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>(initialEdges);

	const nodeTypes = useMemo(() => ({ summary: SummaryNode, keyPoint: KeyPointNode }), []);

	const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

	useEffect(() => {
		setNodes(initialNodes);
		setEdges(initialEdges);
	}, [lectureNote]);

	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
			nodeTypes={nodeTypes}
			fitView>
			<Controls />
			<MiniMap />
			<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
		</ReactFlow>
	);
};
