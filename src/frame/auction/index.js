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
	debug && echo.groupCollapsed('Fledge API: runAdAuction');
	const interestGroups = await db.store.getAll(IG_STORE);
	debug && echo.log(echo.asInfo('all interest groups:'), interestGroups);

	const eligible = getEligible(interestGroups, conf.interest_group_buyers, debug);
	debug && echo.log(echo.asInfo('eligible buyers based on "interest_group_buyers":'), eligible);
	if (!eligible) {
		debug && echo.log(echo.asAlert('No eligible interest group buyers found!'));
		return null;
	}

	const bids = await getBids(eligible, conf, debug);
	debug && echo.log(echo.asInfo('all bids from each buyer:'), bids);

	const filteredBids = bids.filter(item => item);
	debug && echo.log(echo.asInfo('filtered bids:'), filteredBids);
	if (!filteredBids.length) {
		debug && echo.log(echo.asAlert('No bids found!'));
		debug && echo.groupEnd();
		return null;
	}

	debug && echo.info('getting all scores, filtering and sorting:');
	const [ winner ] = await getScores(filteredBids, conf, debug);
	debug && echo.log(echo.asInfo('winner:'), winner);
	if (!winner) {
		debug && echo.log(echo.asAlert('No winner found!'));
		debug && echo.groupEnd();
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
	if (!token) {
		debug && echo.log(echo.asAlert('No auction token found!'));
		debug && echo.groupEnd();
		return null;
	}
	debug && echo.log(echo.asSuccess('auction token:'), token);

	debug && echo.groupEnd();
	return token;
}
