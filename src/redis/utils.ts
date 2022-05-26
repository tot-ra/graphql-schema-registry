export function getTimestamp(): number {
	const now = new Date();
	now.setMinutes(0);
	now.setSeconds(0);
	now.setMilliseconds(0);
	return now.getTime() / 1000;
}
