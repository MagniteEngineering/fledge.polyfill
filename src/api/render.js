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
export default async function renderAd (selector, token) {
	const target = document.querySelector(selector);
	if (!target) {
		throw new Error(`Target not found on the page! Please check that ${target} exists on the page.`);
	}

	const winner = JSON.parse(sessionStorage.getItem(token));
	if (!winner) {
		throw new Error(`A token was not found! Token provided: ${token}`);
	}

	if (winner?.origin !== `${window.top.location.origin}${window.top.location.pathname}`) {
		throw new Error('Something went wrong! No ad was rendered.');
	}

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

	const sellersReport = await getSellerReport(winner.conf, winner);
	await getBuyerReport(winner.conf, winner, sellersReport);
}
