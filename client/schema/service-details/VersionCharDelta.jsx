import React from 'react';
import {
	VersionChars,
	VersionCharsPositive,
	VersionCharsNegative,
} from '../styled';

const VersionsCharDelta = ({ selected, schema }) => {
	let characterDelta;

	if (schema.previousSchema === null) {
		characterDelta = (
			<VersionCharsPositive selected={selected}>
				{`+${schema.characters}`}
			</VersionCharsPositive>
		);
	} else if (schema.characters > schema.previousSchema?.characters) {
		characterDelta = (
			<VersionCharsPositive selected={selected}>
				{`+${schema.characters - schema.previousSchema?.characters}`}
			</VersionCharsPositive>
		);
	} else if (schema.characters === schema.previousSchema?.characters) {
		characterDelta = 'same';
	} else {
		characterDelta = (
			<VersionCharsNegative selected={selected}>
				{`${schema.characters - schema.previousSchema?.characters}`}
			</VersionCharsNegative>
		);
	}

	return (
		<VersionChars title={`${schema.characters} characters`}>
			{characterDelta}
		</VersionChars>
	);
};

export default VersionsCharDelta;
