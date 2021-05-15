import { echo } from '@theholocron/klaxon';
import * as idb from 'idb-keyval';
import { customStore } from './interest-group';
import {
	getBids,
	getEligible,
	getScores,
	uuid,
} from './utils';

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
 *   runAdAuction({ seller: 'foo', decisionLogicUrl: 'http://example.com/auction', interestGroupBuyers: [ 'www.buyer.com' ] });
 */
export default async function runAdAuction (conf, debug) {
	debug && echo.groupCollapsed('Fledge API: runAdAuction');
	const interestGroups = await idb.entries(customStore);
	debug && echo.log(echo.asInfo('all interest groups:'), interestGroups);

	const eligible = getEligible(interestGroups, conf.interestGroupBuyers, debug);
	debug && echo.log(echo.asInfo('eligible buyers based on "interestGroupBuyers":'), eligible);
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

	debug && echo.log(echo.asProcess('getting all scores, filtering and sorting'));
	const winners = await getScores(filteredBids, conf, debug);
	const [ winner ] = winners
		.filter(({ score }) => score > 0)
		.sort((a, b) => (a.score > b.score) ? 1 : -1);
	debug && echo.log(echo.asInfo('winner:'), winner);
	if (!winner) {
		debug && echo.log(echo.asAlert('No winner found!'));
		debug && echo.groupEnd();
		return null;
	}

	debug && echo.log(echo.asProcess('creating an entry in the auction store'));
	const token = uuid();
	sessionStorage.setItem(token, JSON.stringify({
		origin: `${window.top.location.origin}${window.top.location.pathname}`,
		timestamp: Date.now(),
		conf,
		...winner,
	}));
	debug && echo.log(echo.asSuccess('auction token:'), token);

	debug && echo.groupEnd();
	return token;
}
