import {
	hasInvalidOptionTypes,
	isMissingRequiredOptions,
	validateParam,
} from '../utils/index.js';
import types from './types.js';

/*
 * @function
 * @name runAdAuction
 * @description run an auction
 * @author Newton <cnewton@magnite.com>
 * @param {object} options - An object of options to create an interest group {@link types}
 * @throws {Error} Any parameters passed are incorrect or an incorrect type
 * @return {null | Promise<Token>}
 *
 * @example
 *   runAdAuction({ seller: 'foo', decision_logic_url: 'http://example.com/auction', interst_group_buyers: [ 'www.buyer.com' ] });
 */
export default async function runAdAuction (options) {
	validateParam(options, 'object');
	isMissingRequiredOptions(options, [ 'seller', 'decision_logic_url', 'interest_group_buyers' ]);
	hasInvalidOptionTypes(options, types);

	return 'token goes here';
}
