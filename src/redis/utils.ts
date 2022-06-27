export function getTimestamp(date?: string | number): number {
	const now = date !== undefined ? new Date(date) : new Date();
	now.setMinutes(0);
	now.setSeconds(0);
	now.setMilliseconds(0);
	return now.getTime() / 1000;
}
