import db, { IG_STORE } from '../utils/db.js';
import {
	hasInvalidOptionTypes,
	isMissingRequiredOptions,
	validateParam,
} from '../utils/index.js';
import types from './types.js';
import {
	getBids,
	getScores,
	filterBuyers,
} from './utils.js';

/*
 * @function
 * @name runAdAuction
 * @description run an auction
 * @author Newton <cnewton@magnite.com>
 * @param {object} options - An object of options to configure an auction
 * @throws {Error} Any parameters passed are incorrect or an incorrect type
 * @return {null | Promise<Token>}
 *
 * @example
 *   runAdAuction({ seller: 'foo', decision_logic_url: 'http://example.com/auction', interst_group_buyers: [ 'www.buyer.com' ] });
 */
export default async function runAdAuction (conf) {
	validateParam(conf, 'object');
	isMissingRequiredOptions(conf, [ 'seller', 'decision_logic_url', 'interest_group_buyers' ]);
	hasInvalidOptionTypes(conf, types);

	const buyers = await db.store.getAll(IG_STORE);
	const eligibleBuyers = filterBuyers(buyers, conf.interest_group_buyers);
	if (!eligibleBuyers) {
		return null;
	}

	const bids = await getBids(eligibleBuyers, conf);
	if (!bids.length) {
		return null;
	}

	const [ winner ] = await getScores(bids, conf);

	return `${winner.render} token goes here`;
}
