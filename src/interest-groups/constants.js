const hoursPerDay = 24;
const minutesPerHour = 60;
const secondsPerMinute = 60;
const millisecondsPerSecond = 1000;
export const MS_PER_DAY = hoursPerDay * minutesPerHour * secondsPerMinute * millisecondsPerSecond;

export const MAX_DAYS = 30;
export const MAX_EXPIRATION = MAX_DAYS * MS_PER_DAY;

export const REQUIRED_OPTS = [
	'owner',
	'name',
	'bidding_logic_url',
];
