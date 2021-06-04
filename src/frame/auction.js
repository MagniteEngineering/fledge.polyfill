import * as idb from 'idb-keyval';
import { customStore } from './interest-group';
import {
	getBid,
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
	const entries = await idb.entries(customStore);
	const interestGroups = entries
		.flatMap(([ key, value ]) => value) // flatten the two-dimensional array ([igKey, igKeyProps]) to only igKeyProps
		.filter(item => conf.interestGroupBuyers !== '*' ? conf.interestGroupBuyers.includes(item.owner) : item); // check owner of ig is allowed per conf.interestGroupBuyers
	if (!interestGroups || !Array.isArray(interestGroups) || interestGroups.length === 0) {
		return null;
	}

	const bids = await Promise
		.all(interestGroups
			.map(bidder => getBid(bidder, conf))
			.filter(item => item),
		);
	if (!bids.length) {
		return null;
	}

	const winners = await getScores(bids, conf);
	const [ winner ] = winners
		.filter(({ score }) => score > 0)
		.sort((a, b) => (a.score > b.score) ? 1 : -1);
	if (!winner) {
		return null;
	}

	const token = uuid();
	sessionStorage.setItem(token, JSON.stringify({
		timestamp: Date.now(),
		conf,
		winner,
	}));

	return token;
}
