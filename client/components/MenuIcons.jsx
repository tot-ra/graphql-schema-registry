const iconProps = {
	width: 18,
	height: 18,
	viewBox: '0 0 24 24',
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 1.8,
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
	'aria-hidden': true,
};

export function SchemaIcon() {
	return (
		<svg {...iconProps}>
			<circle cx="12" cy="5" r="2.5" />
			<circle cx="6" cy="19" r="2.5" />
			<circle cx="18" cy="19" r="2.5" />
			<path d="M12 7.5v4" />
			<path d="M9.8 14.2L7.6 16.4" />
			<path d="M14.2 14.2l2.2 2.2" />
		</svg>
	);
}

export function ServicesIcon() {
	return (
		<svg {...iconProps}>
			<rect x="4" y="4" width="16" height="5" rx="1.5" />
			<rect x="4" y="10.5" width="16" height="5" rx="1.5" />
			<rect x="4" y="17" width="16" height="3" rx="1.5" />
			<path d="M8 6.5h.01" />
			<path d="M8 13h.01" />
		</svg>
	);
}

export function AnalyticsIcon() {
	return (
		<svg {...iconProps}>
			<path d="M4 19h16" />
			<rect x="6" y="11" width="2.8" height="6" rx="1" />
			<rect x="10.6" y="8" width="2.8" height="9" rx="1" />
			<rect x="15.2" y="5" width="2.8" height="12" rx="1" />
		</svg>
	);
}

export function ClientsIcon() {
	return (
		<svg {...iconProps}>
			<circle cx="9" cy="8" r="3" />
			<path d="M4.5 18a4.5 4.5 0 0 1 9 0" />
			<circle cx="17" cy="9" r="2.2" />
			<path d="M14.8 18a3.2 3.2 0 0 1 4.4-3" />
		</svg>
	);
}

export function PersistedQueriesIcon() {
	return (
		<svg {...iconProps}>
			<path d="M7 6.5h10" />
			<path d="M7 12h10" />
			<path d="M7 17.5h6.5" />
			<circle cx="5" cy="6.5" r="1" fill="currentColor" stroke="none" />
			<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
			<circle cx="5" cy="17.5" r="1" fill="currentColor" stroke="none" />
		</svg>
	);
}

export function LogsIcon() {
	return (
		<svg {...iconProps}>
			<rect x="5" y="4" width="14" height="16" rx="2" />
			<path d="M8 8h8" />
			<path d="M8 12h8" />
			<path d="M8 16h5" />
		</svg>
	);
}

export function ChangeLogIcon() {
	return (
		<svg {...iconProps}>
			<path d="M6 6h12" />
			<path d="M6 12h12" />
			<path d="M6 18h12" />
			<circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
			<circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
			<circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
		</svg>
	);
}
