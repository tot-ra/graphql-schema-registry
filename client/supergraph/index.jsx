import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Tab, Tabs } from '@material-ui/core';
import { useQuery } from '@apollo/client';
import { Kind, parse, print } from 'graphql';

import SpinnerCenter from '../components/SpinnerCenter';
import Info from '../components/Info';
import SourceCodeWithHighlight from '../components/SourceCodeWithHighlight';
import { SUPERGRAPH_SDL } from '../utils/queries';

const SCALARS = new Set(['String', 'Int', 'Float', 'Boolean', 'ID']);
const GRAPH_HEIGHT = 700;
const NODE_COLORS = {
	object: '#2e7d32',
	interface: '#1565c0',
	input: '#ef6c00',
	union: '#6a1b9a',
	enum: '#8d6e63',
	scalar: '#455a64',
};
const SERVICE_PALETTE = [
	'#00897b',
	'#f4511e',
	'#3949ab',
	'#c62828',
	'#5d4037',
	'#6d4c41',
	'#0277bd',
	'#7b1fa2',
	'#2e7d32',
	'#ef6c00',
];

export default function SupergraphSchema() {
	const [tabValue, setTabValue] = useState(1);
	const { data, loading, error } = useQuery(SUPERGRAPH_SDL);
	const sdl = data?.supergraphSDL || '';

	if (loading) {
		return <SpinnerCenter />;
	}

	if (error) {
		return <Info>Unable to load composed supergraph schema</Info>;
	}

	if (!sdl.trim()) {
		return <Info>No active service schemas were found to compose a supergraph.</Info>;
	}

	return (
		<div style={{ padding: '12px 18px' }}>
			<Tabs
				value={tabValue}
				onChange={(_, nextTabValue) => setTabValue(nextTabValue)}
				indicatorColor="primary"
				textColor="primary"
			>
				<Tab label="SDL" />
				<Tab label="Entity Graph" />
			</Tabs>

			<div style={{ marginTop: 12 }}>
				{tabValue === 0 && <SourceCodeWithHighlight code={sdl} />}
				{tabValue === 1 && <EntityGraph sdl={sdl} />}
			</div>
		</div>
	);
}

function EntityGraph({ sdl }) {
	const { graph, parseError } = useMemo(() => buildEntityGraph(sdl), [sdl]);
	const [selectedNodeId, setSelectedNodeId] = useState(null);
	const [colorMode, setColorMode] = useState('service');
	const serviceColors = useMemo(() => buildServiceColors(graph.nodes), [graph.nodes]);
	const selectedEntity = graph.nodes.find((node) => node.id === selectedNodeId) || null;

	const getNodeColor = useCallback(
		(node) => {
			if (colorMode === 'service') {
				const key = node.primaryService || 'unknown';
				return serviceColors[key] || '#546e7a';
			}
			return NODE_COLORS[node.kind] || '#546e7a';
		},
		[colorMode, serviceColors]
	);

	const legendEntries =
		colorMode === 'service'
			? Object.entries(serviceColors).map(([label, color]) => ({ label, color }))
			: Object.entries(NODE_COLORS).map(([label, color]) => ({ label, color }));

	if (parseError) {
		return <Info>Could not parse supergraph SDL into an entity graph.</Info>;
	}

	if (!graph.nodes.length) {
		return <Info>No schema entities found to visualize.</Info>;
	}

	return (
		<div>
			<div
				style={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 10,
					marginBottom: 12,
					fontSize: 12,
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
					<span style={{ fontWeight: 600 }}>Color by:</span>
					<button
						type="button"
						onClick={() => setColorMode('kind')}
						style={{
							border: '1px solid #c4c4c4',
							background: colorMode === 'kind' ? '#e8f0fe' : '#ffffff',
							padding: '4px 8px',
							borderRadius: 3,
							cursor: 'pointer',
						}}
					>
						Entity Type
					</button>
					<button
						type="button"
						onClick={() => setColorMode('service')}
						style={{
							border: '1px solid #c4c4c4',
							background: colorMode === 'service' ? '#e8f0fe' : '#ffffff',
							padding: '4px 8px',
							borderRadius: 3,
							cursor: 'pointer',
						}}
					>
						Origin Service
					</button>
				</div>
				{legendEntries.map((entry) => (
					<div
						key={entry.label}
						style={{ display: 'flex', alignItems: 'center', gap: 6 }}
					>
						<span
							style={{
								width: 12,
								height: 12,
								borderRadius: '50%',
								backgroundColor: entry.color,
								display: 'inline-block',
							}}
						/>
						<span>{entry.label}</span>
					</div>
				))}
			</div>
			<ForceGraphCanvas
				nodes={graph.nodes}
				links={graph.links}
				onSelectNode={setSelectedNodeId}
				selectedNodeId={selectedNodeId}
				getNodeColor={getNodeColor}
			/>
			<EntityDetails entity={selectedEntity} />
		</div>
	);
}

function EntityDetails({ entity }) {
	if (!entity) {
		return (
			<div style={{ marginTop: 12, color: '#4b5563', fontSize: 14 }}>
				Click an entity node to inspect its declaration.
			</div>
		);
	}

	return (
		<div style={{ marginTop: 12 }}>
			<div style={{ marginBottom: 8, fontWeight: 600 }}>
				{entity.id} ({entity.kind})
			</div>
			<div style={{ marginBottom: 8, fontSize: 13, color: '#4b5563' }}>
				Origin services:{' '}
				{entity.serviceNames && entity.serviceNames.length
					? entity.serviceNames.join(', ')
					: 'unknown'}
			</div>
			<SourceCodeWithHighlight code={entity.declaration} />
		</div>
	);
}

function ForceGraphCanvas({
	nodes,
	links,
	onSelectNode,
	selectedNodeId,
	getNodeColor,
}) {
	const containerRef = useRef(null);
	const canvasRef = useRef(null);
	const [width, setWidth] = useState(0);
	const viewportRef = useRef({ offsetX: 0, offsetY: 0, scale: 1 });
	const interactionRef = useRef({
		isPanning: false,
		moved: false,
		startX: 0,
		startY: 0,
		startOffsetX: 0,
		startOffsetY: 0,
		downNodeId: null,
	});
	const simulationRef = useRef([]);
	const selectedNodeIdRef = useRef(selectedNodeId);
	const nodeColorRef = useRef(getNodeColor);

	useEffect(() => {
		selectedNodeIdRef.current = selectedNodeId;
	}, [selectedNodeId]);

	useEffect(() => {
		nodeColorRef.current = getNodeColor;
	}, [getNodeColor]);

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const resizeObserver = new ResizeObserver(([entry]) => {
			setWidth(Math.max(320, Math.floor(entry.contentRect.width)));
		});

		resizeObserver.observe(containerRef.current);

		return () => resizeObserver.disconnect();
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const wheelHandler = (event) => {
			event.preventDefault();
			event.stopPropagation();

			const rect = canvas.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;
			const mouseY = event.clientY - rect.top;
			const view = viewportRef.current;
			const prevScale = view.scale;
			const nextScale = Math.min(
				3.5,
				Math.max(0.35, prevScale * (event.deltaY > 0 ? 0.9 : 1.1))
			);

			if (nextScale === prevScale) {
				return;
			}

			const graphX = (mouseX - view.offsetX) / prevScale;
			const graphY = (mouseY - view.offsetY) / prevScale;
			view.scale = nextScale;
			view.offsetX = mouseX - graphX * nextScale;
			view.offsetY = mouseY - graphY * nextScale;
		};

		canvas.addEventListener('wheel', wheelHandler, { passive: false });

		return () => {
			canvas.removeEventListener('wheel', wheelHandler);
		};
	}, []);

	useEffect(() => {
		if (!canvasRef.current || !width) {
			return;
		}

		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		const dpr = window.devicePixelRatio || 1;
		const height = GRAPH_HEIGHT;

		canvas.width = width * dpr;
		canvas.height = height * dpr;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		const simulationNodes = nodes.map((node) => ({
			...node,
			x: width / 2 + (Math.random() - 0.5) * width * 0.35,
			y: height / 2 + (Math.random() - 0.5) * height * 0.35,
			vx: 0,
			vy: 0,
		}));
		simulationRef.current = simulationNodes;
		const nodeIndex = new Map(simulationNodes.map((node, index) => [node.id, index]));
		const simulationLinks = links
			.map((link) => {
				const sourceIndex = nodeIndex.get(link.source);
				const targetIndex = nodeIndex.get(link.target);

				if (sourceIndex === undefined || targetIndex === undefined) {
					return null;
				}

				return {
					source: sourceIndex,
					target: targetIndex,
					kind: link.kind,
				};
			})
			.filter(Boolean);

		let animationFrameId;
		let alpha = 1;

		const tick = () => {
			const repulsionStrength = Math.max(3500, simulationNodes.length * 85);
			const centeringStrength = 0.004;
			const springStrength = 0.06;
			const damping = 0.86;
			const preferredLinkDistance = 165;
			const forceScale = Math.max(0.08, alpha);

			for (let i = 0; i < simulationNodes.length; i += 1) {
				const first = simulationNodes[i];

				for (let j = i + 1; j < simulationNodes.length; j += 1) {
					const second = simulationNodes[j];
					const dx = second.x - first.x;
					const dy = second.y - first.y;
					const distanceSq = dx * dx + dy * dy + 0.01;
					const distance = Math.sqrt(distanceSq);
					const force = (repulsionStrength / distanceSq) * forceScale;
					const fx = (dx / distance) * force;
					const fy = (dy / distance) * force;

					first.vx -= fx;
					first.vy -= fy;
					second.vx += fx;
					second.vy += fy;

					const collisionDistance = first.radius + second.radius + 8;
					if (distance < collisionDistance) {
						const push =
							((collisionDistance - distance) / collisionDistance) *
							0.8 *
							forceScale;
						first.vx -= (dx / distance) * push;
						first.vy -= (dy / distance) * push;
						second.vx += (dx / distance) * push;
						second.vy += (dy / distance) * push;
					}
				}
			}

			for (const link of simulationLinks) {
				const source = simulationNodes[link.source];
				const target = simulationNodes[link.target];
				const dx = target.x - source.x;
				const dy = target.y - source.y;
				const distance = Math.sqrt(dx * dx + dy * dy) || 0.001;
				const displacement = distance - preferredLinkDistance;
				const force = displacement * springStrength * forceScale;
				const fx = (dx / distance) * force;
				const fy = (dy / distance) * force;

				source.vx += fx;
				source.vy += fy;
				target.vx -= fx;
				target.vy -= fy;
			}

			for (const node of simulationNodes) {
				node.vx += (width / 2 - node.x) * centeringStrength * forceScale;
				node.vy += (height / 2 - node.y) * centeringStrength * forceScale;
				node.vx *= damping;
				node.vy *= damping;
				node.vx = Math.max(-6, Math.min(6, node.vx));
				node.vy = Math.max(-6, Math.min(6, node.vy));
				node.x += node.vx;
				node.y += node.vy;
			}
			alpha *= 0.995;

			renderGraph(
				ctx,
				width,
				height,
				simulationNodes,
				simulationLinks,
				viewportRef.current,
				nodeColorRef.current,
				selectedNodeIdRef.current
			);
			animationFrameId = window.requestAnimationFrame(tick);
		};

		tick();

		return () => {
			if (animationFrameId) {
				window.cancelAnimationFrame(animationFrameId);
			}
		};
	}, [width, nodes, links]);

	const toGraphCoords = (clientX, clientY) => {
		const rect = canvasRef.current.getBoundingClientRect();
		const x = clientX - rect.left;
		const y = clientY - rect.top;
		const view = viewportRef.current;

		return {
			x: (x - view.offsetX) / view.scale,
			y: (y - view.offsetY) / view.scale,
		};
	};

	const pickNode = (graphX, graphY) => {
		for (const node of simulationRef.current) {
			const dx = graphX - node.x;
			const dy = graphY - node.y;
			if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 2) {
				return node.id;
			}
		}
		return null;
	};

	const onMouseDown = (event) => {
		const { x, y } = toGraphCoords(event.clientX, event.clientY);
		const downNodeId = pickNode(x, y);
		interactionRef.current = {
			isPanning: true,
			moved: false,
			startX: event.clientX,
			startY: event.clientY,
			startOffsetX: viewportRef.current.offsetX,
			startOffsetY: viewportRef.current.offsetY,
			downNodeId,
		};
	};

	const onMouseMove = (event) => {
		if (!interactionRef.current.isPanning) {
			return;
		}

		const dx = event.clientX - interactionRef.current.startX;
		const dy = event.clientY - interactionRef.current.startY;
		if (Math.abs(dx) + Math.abs(dy) > 2) {
			interactionRef.current.moved = true;
		}
		viewportRef.current.offsetX = interactionRef.current.startOffsetX + dx;
		viewportRef.current.offsetY = interactionRef.current.startOffsetY + dy;
	};

	const onMouseUp = (event) => {
		if (!interactionRef.current.isPanning) {
			return;
		}

		if (!interactionRef.current.moved) {
			const { x, y } = toGraphCoords(event.clientX, event.clientY);
			const selectedNodeId = pickNode(x, y) || interactionRef.current.downNodeId;
			onSelectNode(selectedNodeId);
		}

		interactionRef.current.isPanning = false;
	};

	return (
		<div ref={containerRef} style={{ width: '100%' }}>
			<canvas
				ref={canvasRef}
				style={{ border: '1px solid #d9d9d9', borderRadius: 4, background: '#fdfdfd' }}
				onMouseDown={onMouseDown}
				onMouseMove={onMouseMove}
				onMouseUp={onMouseUp}
				onMouseLeave={onMouseUp}
			/>
		</div>
	);
}

function renderGraph(
	ctx,
	width,
	height,
	nodes,
	links,
	viewport,
	getNodeColor,
	selectedNodeId
) {
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, width, height);
	ctx.save();
	ctx.translate(viewport.offsetX, viewport.offsetY);
	ctx.scale(viewport.scale, viewport.scale);

	for (const link of links) {
		const source = nodes[link.source];
		const target = nodes[link.target];
		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.strokeStyle = link.kind === 'implements' ? '#9e9e9e' : '#bdbdbd';
		if (link.kind === 'implements') {
			ctx.setLineDash([4, 3]);
		} else {
			ctx.setLineDash([]);
		}
		ctx.moveTo(source.x, source.y);
		ctx.lineTo(target.x, target.y);
		ctx.stroke();
	}

	ctx.setLineDash([]);

	for (const node of nodes) {
		ctx.beginPath();
		ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
		ctx.fillStyle = getNodeColor(node);
		ctx.fill();
		ctx.strokeStyle = node.id === selectedNodeId ? '#111827' : '#1f2937';
		ctx.lineWidth = node.id === selectedNodeId ? 2 : 0.7;
		ctx.stroke();

		ctx.fillStyle = '#111827';
		ctx.font = '12px "Source Sans Pro", sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.fillText(node.id, node.x, node.y + node.radius + 3);
	}

	ctx.restore();
}

function buildEntityGraph(sdl) {
	try {
		const documentNode = parse(sdl);
		const nodesByName = new Map();
		const links = [];
		const graphIdToServiceName = getGraphIdToServiceName(documentNode);

		for (const definition of documentNode.definitions) {
			const serviceNames = getDefinitionServiceNames(
				definition,
				graphIdToServiceName
			);
			const propertyCount = getDefinitionPropertyCount(definition);
			const nodeBase = {
				id: definition.name?.value,
				declaration: print(definition),
				serviceNames,
				primaryService: serviceNames[0] || 'unknown',
				propertyCount,
				radius: nodeRadiusForPropertyCount(propertyCount),
			};

			if (definition.kind === Kind.OBJECT_TYPE_DEFINITION) {
				nodesByName.set(definition.name.value, {
					...nodeBase,
					kind: 'object',
				});
			}
			if (definition.kind === Kind.INTERFACE_TYPE_DEFINITION) {
				nodesByName.set(definition.name.value, {
					...nodeBase,
					kind: 'interface',
				});
			}
			if (definition.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION) {
				nodesByName.set(definition.name.value, {
					...nodeBase,
					kind: 'input',
				});
			}
			if (definition.kind === Kind.UNION_TYPE_DEFINITION) {
				nodesByName.set(definition.name.value, {
					...nodeBase,
					kind: 'union',
				});
			}
			if (definition.kind === Kind.ENUM_TYPE_DEFINITION) {
				nodesByName.set(definition.name.value, {
					...nodeBase,
					kind: 'enum',
				});
			}
			if (definition.kind === Kind.SCALAR_TYPE_DEFINITION) {
				nodesByName.set(definition.name.value, {
					...nodeBase,
					kind: 'scalar',
				});
			}
		}

		for (const definition of documentNode.definitions) {
			if (
				definition.kind === Kind.OBJECT_TYPE_DEFINITION ||
				definition.kind === Kind.INTERFACE_TYPE_DEFINITION
			) {
				for (const iface of definition.interfaces || []) {
					links.push({
						source: definition.name.value,
						target: iface.name.value,
						kind: 'implements',
					});
				}
			}

			if (
				definition.kind === Kind.OBJECT_TYPE_DEFINITION ||
				definition.kind === Kind.INTERFACE_TYPE_DEFINITION ||
				definition.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION
			) {
				for (const field of definition.fields || []) {
					const typeName = unwrapTypeName(field.type);

					if (!typeName || SCALARS.has(typeName)) {
						continue;
					}

					links.push({
						source: definition.name.value,
						target: typeName,
						kind: 'field',
					});

					for (const argument of field.arguments || []) {
						const argTypeName = unwrapTypeName(argument.type);

						if (!argTypeName || SCALARS.has(argTypeName)) {
							continue;
						}

						links.push({
							source: definition.name.value,
							target: argTypeName,
							kind: 'argument',
						});
					}
				}
			}

			if (definition.kind === Kind.UNION_TYPE_DEFINITION) {
				for (const unionType of definition.types || []) {
					links.push({
						source: definition.name.value,
						target: unionType.name.value,
						kind: 'union',
					});
				}
			}
		}

		const filteredLinks = deduplicateLinks(
			links.filter(
				(link) =>
					link.source !== link.target &&
					nodesByName.has(link.source) &&
					nodesByName.has(link.target)
			)
		);

		return {
			graph: {
				nodes: [...nodesByName.values()],
				links: filteredLinks,
			},
			parseError: false,
		};
	} catch {
		return {
			graph: {
				nodes: [],
				links: [],
			},
			parseError: true,
		};
	}
}

function deduplicateLinks(links) {
	const seen = new Set();
	const result = [];

	for (const link of links) {
		const key = `${link.source}|${link.target}|${link.kind}`;

		if (seen.has(key)) {
			continue;
		}

		seen.add(key);
		result.push(link);
	}

	return result;
}

function buildServiceColors(nodes) {
	const serviceNames = [];
	const seen = new Set();

	for (const node of nodes) {
		const key = node.primaryService || 'unknown';
		if (!seen.has(key)) {
			seen.add(key);
			serviceNames.push(key);
		}
	}

	const colors = {};
	for (const [index, serviceName] of serviceNames.entries()) {
		colors[serviceName] = SERVICE_PALETTE[index % SERVICE_PALETTE.length];
	}

	if (!colors.unknown) {
		colors.unknown = '#546e7a';
	}

	return colors;
}

function getGraphIdToServiceName(documentNode) {
	const map = new Map();
	const enumDef = documentNode.definitions.find(
		(definition) =>
			definition.kind === Kind.ENUM_TYPE_DEFINITION &&
			definition.name?.value === 'join__Graph'
	);

	if (!enumDef) {
		return map;
	}

	for (const enumValue of enumDef.values || []) {
		let mappedName = enumValue.name.value;
		for (const directive of enumValue.directives || []) {
			if (directive.name.value !== 'join__graph') {
				continue;
			}
			const explicitName = getDirectiveArgValue(directive, 'name');
			if (typeof explicitName === 'string' && explicitName.length > 0) {
				mappedName = explicitName;
			}
		}
		map.set(enumValue.name.value, mappedName);
	}

	return map;
}

function getDefinitionServiceNames(definition, graphIdToServiceName) {
	const services = [];
	const addService = (value) => {
		if (!value) {
			return;
		}
		if (!services.includes(value)) {
			services.push(value);
		}
	};

	for (const directive of definition.directives || []) {
		if (directive.name.value !== 'join__type' && directive.name.value !== 'join__owner') {
			continue;
		}
		const graphArg = getDirectiveArgValue(directive, 'graph');
		if (!graphArg) {
			continue;
		}
		addService(graphIdToServiceName.get(graphArg) || graphArg);
	}

	return services;
}

function getDirectiveArgValue(directive, argName) {
	const arg = (directive.arguments || []).find((row) => row.name.value === argName);
	if (!arg || !arg.value) {
		return null;
	}
	if (arg.value.kind === Kind.ENUM || arg.value.kind === Kind.STRING) {
		return arg.value.value;
	}
	return null;
}

function unwrapTypeName(typeNode) {
	if (!typeNode) {
		return null;
	}

	if (typeNode.kind === Kind.NAMED_TYPE) {
		return typeNode.name.value;
	}

	return unwrapTypeName(typeNode.type);
}

function getDefinitionPropertyCount(definition) {
	if (
		definition.kind === Kind.OBJECT_TYPE_DEFINITION ||
		definition.kind === Kind.INTERFACE_TYPE_DEFINITION ||
		definition.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION
	) {
		return definition.fields?.length || 0;
	}
	if (definition.kind === Kind.ENUM_TYPE_DEFINITION) {
		return definition.values?.length || 0;
	}
	if (definition.kind === Kind.UNION_TYPE_DEFINITION) {
		return definition.types?.length || 0;
	}
	return 0;
}

function nodeRadiusForPropertyCount(propertyCount) {
	const minRadius = 7;
	const maxRadius = 22;
	const radius = minRadius + Math.log2(propertyCount + 1) * 2.8;

	return Math.max(minRadius, Math.min(maxRadius, radius));
}
