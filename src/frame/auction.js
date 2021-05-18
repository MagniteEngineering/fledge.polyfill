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
export default async function runAdAuction (conf) {
	const interestGroups = await idb.entries(customStore);

	const eligible = getEligible(interestGroups, conf.interestGroupBuyers);
	if (!eligible) {
		return null;
	}

	const bids = await getBids(eligible, conf);

	const filteredBids = bids.filter(item => item);
	if (!filteredBids.length) {
		return null;
	}

	const winners = await getScores(filteredBids, conf);
	const [ winner ] = winners
		.filter(({ score }) => score > 0)
		.sort((a, b) => (a.score > b.score) ? 1 : -1);
	if (!winner) {
		return null;
	}

	const token = uuid();
	sessionStorage.setItem(token, JSON.stringify({
		origin: `${window.top.location.origin}${window.top.location.pathname}`,
		timestamp: Date.now(),
		conf,
		...winner,
	}));

	return token;
}
