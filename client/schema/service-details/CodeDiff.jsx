import React from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';

const newStyles = {
	variables: {
		dark: {
			diffViewerBackground: '#2e303c',
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
	line: {
		padding: '10px 2px',
		'&:hover': {
			background: '#000e95',
		},
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
