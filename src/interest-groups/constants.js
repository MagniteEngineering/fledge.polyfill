// hours per day: 24;
// minutes per hour: 60;
// seconds per minute :60;
// milliseconds per second: 1000;
export const MS_PER_DAY = 86400000;

export const MAX_DAYS = 30;
export const MAX_EXPIRATION = MAX_DAYS * MS_PER_DAY;

export const REQUIRED_OPTS = [
	'owner',
	'name',
	'bidding_logic_url',
];
