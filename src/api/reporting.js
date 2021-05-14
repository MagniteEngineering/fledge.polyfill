/* eslint-disable no-cond-assign */
import { echo } from '@theholocron/klaxon';

/*
 * @function
 * @name getSellerReport
 * @description given the results of an auction, grab the report from the seller
 * @author Newton <cnewton@magnite.com>
 * @param {object} conf - an auction configuration object
 * @param {object} results - the results of the auction
 * @return {object} an object of data to pass back to the buyers report
 */
export const getSellerReport = async (conf, results, debug) => {
	debug && echo.groupCollapsed('render utils: getSellerReport');
	const { reportResult } = await import(conf.decisionLogicUrl);

	// check if there is even a function
	if (!reportResult || typeof reportResult !== 'function') {
		debug && echo.log(echo.asWarning(`No 'reportResult' function found!`));
		debug && echo.groupEnd();
		return null;
	}

	let report;
	// generate a report by providing all of the necessary information
	try {
		debug && echo.log(echo.asProcess('fetching seller reporting'));
		report = reportResult(conf, {
			topWindowHostname: window.top.location.hostname,
			interestGroupOwner: results.bid.owner,
			interestGroupName: results.bid.name,
			renderUrl: results.bid.render,
			bid: results.bid.bid,
		});
		debug && echo.log(echo.asSuccess('report found'));
	} catch (err) {
		echo.log(echo.asAlert(err));
		debug && echo.groupEnd();
		return null;
	}

	debug && echo.groupEnd();
	return report;
};

/*
 * @function
 * @name getBuyerReport
 * @description given the results of an auction, grab the report from the buyer
 * @author Newton <cnewton@magnite.com>
 * @param {object} conf - an auction configuration object
 * @param {object} results - the results of the auction
 * @param {object} report - the report object from the sellers report
 * @return {void} has a side effect of generating a report for the buyer
 */
export const getBuyerReport = async (conf, results, sellersReport, debug) => {
	debug && echo.groupCollapsed('render utils: getBuyerReport');
	const wins = import(results.bid.biddingLogicUrl)
		.then(({ reportWin }) => {
			// check if there is even a function
			if (!reportWin || typeof reportWin !== 'function') {
				debug && echo.log(echo.asWarning(`No 'reportWin' function found!`));
				return null;
			}

			let report;

			try {
				debug && echo.log(echo.asProcess('fetching buyer reporting'));
				// generate a report by providing all of the necessary information
				report = reportWin(conf?.auctionSignals, conf?.perBuyerSignals?.[results.bid.owner], sellersReport, {
					topWindowHostname: window.top.location.hostname,
					interestGroupOwner: results.bid.owner,
					interestGroupName: results.bid.name,
					renderUrl: results.bid.render,
					bid: results.bid.bid,
				});
				debug && echo.log(echo.asSuccess('report found'));
			} catch (err) {
				echo.log(echo.asAlert(`There was an error in the 'reportWin' function:`));
				echo.log(err);
				report = null;
			}

			return report;
		})
		.catch(err => {
			echo.log(echo.asAlert(err));
			return null;
		});

	debug && echo.groupEnd();
	return wins;
};
