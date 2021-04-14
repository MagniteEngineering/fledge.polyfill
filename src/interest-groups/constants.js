/*
 * @const {number}
 * @summary Maximum expiration allowed for an Interest Group to exist
 * @description Milliseconds occuring per day multiplied by the maximum number of days (maximum dayus (30) * hours per day (24) * minutes per hour (60) * seconds per minute (60) * milliseconds per second (1000))
 */
export const MAX_EXPIRATION = 2592000000;

/*
 * @const {array}
 * @description The required options provided to join an interest group
 */
export const REQUIRED_OPTS = [
	'owner',
	'name',
	'bidding_logic_url',
];
