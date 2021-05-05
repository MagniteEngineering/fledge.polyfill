import { db, echo } from '../../utils/index.js';
import { AUCTION_STORE, IG_STORE } from '../../utils/db.js';
import {
	getBids,
	getEligible,
	getScores,
	uuid,
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
export default async function runAdAuction (conf, debug) {
	debug && echo.info('getting all interest groups');
	const interestGroups = await db.store.getAll(IG_STORE);
	debug && echo.table(interestGroups);

	debug && echo.info('checking eligibility of buyers based on "interest_group_buyers"');
	const eligible = getEligible(interestGroups, conf.interest_group_buyers);
	debug && echo.table(eligible);
	if (!eligible) {
		debug && echo.error('No eligible interest group buyers found!');
		return null;
	}

	debug && echo.info('getting all bids from each buyer');
	const bids = await getBids(eligible, conf, debug);
	debug && echo.table(bids);
	debug && echo.info('filtering out invalid bids');
	const filteredBids = bids.filter(item => item);
	debug && echo.table(filteredBids);
	if (!filteredBids.length) {
		debug && echo.error('No bids found!');
		return null;
	}

	debug && echo.info('getting all scores, filtering and sorting');
	const [ winner ] = await getScores(filteredBids, conf, debug);
	debug && echo.log('winner:', winner);
	if (!winner) {
		debug && echo.error('No winner found!');
		return null;
	}

	debug && echo.info('creating an entry in the auction store');
	const token = await db.store.add(AUCTION_STORE, {
		id: uuid(),
		origin: `${window.top.location.origin}${window.top.location.pathname}`,
		timestamp: Date.now(),
		conf,
		...winner,
	});
	debug && echo.log('auction token:', token);
	if (!token) {
		debug && echo.error('No auction token found!');
		return null;
	}

	return token;
}
