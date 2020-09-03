import { useState, useEffect, useCallback, useRef } from 'react';

export function useClipboard() {
	const [allowed, setAllowed] = useState(false);
	const [copied, setCopied] = useState(false);
	const timeout = useRef(null);

	useEffect(() => {
		requestPermission().then((isAllowed) => setAllowed(isAllowed));
	}, []);

	const updateCopied = useCallback(
		(text) => {
			clearTimeout(timeout.current);
			setCopied(false);

			updateClipboard(text)
				.then(() => {
					setCopied(true);
					timeout.current = setTimeout(() => {
						setCopied(false);
					}, 1000);
				})
				.catch(() => setCopied(false));
		},
		[timeout, setCopied]
	);

	// eslint-disable-next-line
	return [copied, allowed ? updateCopied : notAllowed];
}

function requestPermission() {
	return navigator.permissions
		.query({ name: 'clipboard-write' })
		.then(
			(result) => result.state === 'granted' || result.state === 'prompt'
		);
}

function updateClipboard(text) {
	return navigator.clipboard?.writeText(text);
}

function notAllowed() {
	console.error('Not allowed to write to clipboard'); // eslint-disable-line
}
