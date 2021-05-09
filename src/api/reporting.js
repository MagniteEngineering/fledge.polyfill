/* eslint-disable camelcase, no-cond-assign */
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
	const { report_result, reportResult } = await import(conf.decision_logic_url);
	let runReport = reportResult;

	if (report_result) {
		runReport = report_result;
	}

	// check if there is even a function
	if (!runReport || typeof runReport !== 'function') {
		debug && echo.log(echo.asWarning(`No 'reportResult' function found!`));
		debug && echo.groupEnd();
		return null;
	}

	let report;
	// generate a report by providing all of the necessary information
	try {
		debug && echo.log(echo.asProcess('fetching seller reporting'));
		report = runReport(conf, {
			top_window_hostname: window.top.location.hostname,
			interest_group_owner: results.bid.owner,
			interest_group_name: results.bid.name,
			render_url: results.bid.render,
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
	const wins = import(results.bid.bidding_logic_url)
		.then(({ reportWin, report_win }) => {
			let runReport = reportWin;

			if (report_win) {
				runReport = report_win;
			}

			// check if there is even a function
			if (!runReport || typeof runReport !== 'function') {
				debug && echo.log(echo.asWarning(`No 'reportWin' function found!`));
				return null;
			}

			let report;

			try {
				debug && echo.log(echo.asProcess('fetching buyer reporting'));
				// generate a report by providing all of the necessary information
				report = runReport(conf?.auction_signals, conf?.per_buyer_signals?.[results.bid.owner], sellersReport, {
					top_window_hostname: window.top.location.hostname,
					interest_group_owner: results.bid.owner,
					interest_group_name: results.bid.name,
					render_url: results.bid.render,
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
