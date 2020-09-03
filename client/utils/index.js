export const colors = {
	green: {
		hex: 'green',
	},
	black: {
		hex4: '#111111',
		hex5: '#222222',
		hex8: '#333333',
		hex12: '#444444',
		hex24: '#555555',
		hex32: '#666666',
		hex64: '#777777',
		hex256: '#EEEEEE',
	},
};

export const elevations = {
	1: '1',
	2: '2',
	3: '3',
	4: '4',
};

export function splitQuery(queryString, lines = 4) {
	return queryString.split('\n').slice(0, lines).join('\n');
}
