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
		width: 'auto',
	},
	line: {
		display: 'flex',
		'line-height': '1',
		'font-size': '14px',
		'font-family': 'Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace',
		'&:hover': {
			background: '#000e95',
		},
	},
	gutter: {
		minWidth: '20px',
	},
	content: {
		flexGrow: 1,
		overflow: 'none',
		pre: {
			'font-family': 'Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace',
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
