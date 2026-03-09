import { useMemo } from 'react';
import { parseDiffFromFile } from '@pierre/diffs';
import { FileDiff } from '@pierre/diffs/react';

const diffOptions = {
	diffStyle: 'split',
	lineDiffType: 'word',
	expandUnchanged: true,
	hunkSeparators: 'line-info',
	overflow: 'scroll',
	themeType: 'dark',
	theme: {
		dark: 'github-dark-default',
		light: 'github-light-default',
	},
};

const CodeDiff = (props) => {
	const fileDiff = useMemo(
		() =>
			parseDiffFromFile(
				{
					name: 'schema.graphql',
					contents: props.oldCode || '',
					lang: 'graphql',
				},
				{
					name: 'schema.graphql',
					contents: props.newCode || '',
					lang: 'graphql',
				}
			),
		[props.oldCode, props.newCode]
	);

	const options = {
		...diffOptions,
		diffStyle: props.oldCode ? 'split' : 'unified',
	};

	return <FileDiff fileDiff={fileDiff} options={options} />;
};

export default CodeDiff;
