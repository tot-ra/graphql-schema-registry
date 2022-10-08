// eslint-disable-next-line no-unused-vars
import React from 'react';

export default function Info({ children }) {
	return (
		<div
			style={{
				padding: '10px 15px',
				color: 'white',
				backgroundColor: '#3279e2',
			}}
		>
			{children}
		</div>
	);
}
