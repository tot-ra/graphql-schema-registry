import React from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';

const newStyles = {
	variables: {
		dark: {
			diffViewerBackground: '#1e1e1e',
			diffViewerColor: '#FFF',
			addedColor: 'white',
			removedColor: 'white',
			addedBackground: '#235a00',
			wordAddedBackground: '#235a00',
			addedGutterBackground: '#235a00',
			removedBackground: '#62111b',
			wordRemovedBackground: '#62111b',
			removedGutterBackground: '#62111b',
			gutterBackground: '#16171d',
			gutterBackgroundDark: '#0e0e13',
			highlightBackground: '#2a3967',
			highlightGutterBackground: '#2d4077',
			codeFoldGutterBackground: '#21232b',
			codeFoldBackground: '#262831',
			emptyLineBackground: '#363946',
			gutterColor: '#c7c8d8',
			addedGutterColor: '#4aba00',
			removedGutterColor: '#af1e30',
			codeFoldContentColor: '#aeb4d6',
			diffViewerTitleBackground: '#2f323e',
			diffViewerTitleColor: '#555a7b',
			diffViewerTitleBorderColor: '#353846',
		},
	},
	emptyGutter: {
		'min-width': '1px',
		padding: '0',
	},
	gutter: {
		'min-width': '1px',
	},
	line: {
		'line-height': '1',
		'font-size': '13px',
		'font-family': 'Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace',
		'&:hover': {
			background: '#000e95',
		},
	},
	content: {
		height: '18px',
		width: 'auto',
		pre: {
			'line-height': '18px',
		},
	},
	diffContainer: {
		pre: {
			'line-height': '18px',
		},
	},
	marker: {
		width: '10px',
		padding: '0',
	},
};

const CodeDiff = (props) => {
	return (
		<ReactDiffViewer
			oldValue={props.oldCode}
			newValue={props.newCode}
			useDarkTheme={true}
			splitView={props.oldCode ? true : false}
			styles={newStyles}
			compareMethod={DiffMethod.WORDS}
		/>
	);
};

export default CodeDiff;
