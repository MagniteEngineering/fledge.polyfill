import db, { AUCTION_STORE, IG_STORE } from '../utils/db.js';
import validate from '../utils/validation.js';
import types from './types.js';
import {
	getBids,
	getEligible,
	getScores,
	uuidv4,
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
	validate.param(conf, 'object');
	validate.hasRequiredKeys(conf, [ 'seller', 'decision_logic_url', 'interest_group_buyers' ]);
	validate.hasInvalidOptionTypes(conf, types);

	// console.info('get all interest groups');
	const interestGroups = await db.store.getAll(IG_STORE);

	// console.info('checking eligibility of buyers based on "interest_group_buyers"');
	const eligible = getEligible(interestGroups, conf.interest_group_buyers);
	if (!eligible) {
		return null;
	}

	// console.info('get all bids from each buyer');
	const bids = await getBids(eligible, conf);
	if (!bids.length) {
		return null;
	}

	// console.info('get the winning bid');
	const [ winner ] = await getScores(bids, conf);
	if (!winner) {
		return null;
	}

	// console.info('creating an entry in the auction store');
	const token = await db.store.add(AUCTION_STORE, { id: uuidv4(), ...winner });
	if (!token) {
		return null;
	}

	return token;
}
