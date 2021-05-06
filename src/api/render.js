import { echo } from '@theholocron/klaxon';
import {
	getBuyerReport,
	getSellerReport,
} from './reporting';
import { frame } from './utils';

/*
 * @function
 * @name renderAd
 * @description render an ad
 * @author Newton <cnewton@magnite.com>
 * @param {string} selector - a string reprensenting a valid selector to find an element on the page
 * @param {string} token - a string that represents the results from an auction run via the `fledge.runAdAuction` call
 * @throws {Error} Any parameters passed are incorrect or an incorrect type
 * @return {Promise<null | true>}
 *
 * @example
 *   renderAd('#ad-slot-1', '76941e71-2ed7-416d-9c55-36d07beff786');
 */
export default async function renderAd (selector, token, debug) {
	debug && echo.groupCollapsed('Fledge API: renderAd');
	const target = document.querySelector(selector);
	if (!target) {
		throw new Error(`Target not found on the page! Please check that ${target} exists on the page.`);
	}
	debug && echo.log(echo.asInfo('target:'), target);

	const winner = JSON.parse(sessionStorage.getItem(token));
	if (!winner) {
		throw new Error(`A token was not found! Token provided: ${token}`);
	}
	debug && echo.log(echo.asInfo('winner data:'), winner);

	debug && echo.log(echo.asProcess('checking that winner to be rendered is on the same hostname as the auction'));
	if (winner?.origin !== `${window.top.location.origin}${window.top.location.pathname}`) {
		debug && echo.error(`Attempting to render the winner on a location that doesn't match the auctions hostname`, { winner: winner.origin, auction: `${window.top.location.origin}${window.top.location.pathname}` });
		throw new Error('Something went wrong! No ad was rendered.');
	}
	debug && echo.log(echo.asSuccess('winner is on the same hostname as the auction'));

	debug && echo.log(echo.asProcess('rendering an iframe with the winning ad'));
	frame.create({
		source: winner.bid.render,
		target,
		props: {
			id: `fledge-auction-${token}`,
		},
	});
	const ad = document.querySelector(`#fledge-auction-${token}`);
	if (!ad) {
		throw new Error('Something went wrong! No ad was rendered.');
	}
	debug && echo.log(echo.asSuccess('iframe with winning ad has rendered'));
	debug && echo.log(echo.asInfo('ads target:'), ad);
	debug && echo.groupEnd();

	debug && echo.groupCollapsed('Fledge API: Reporting');
	const sellersReport = await getSellerReport(winner.conf, winner, debug);
	debug && echo.log(echo.asSuccess('sellers report:'), sellersReport);
	const buyersReport = await getBuyerReport(winner.conf, winner, sellersReport, debug);
	debug && echo.log(echo.asSuccess('buyers report:'), buyersReport);
	debug && echo.groupEnd();

	return true;
}
