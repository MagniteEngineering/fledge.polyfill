/* eslint-disable compat/compat */
import fledge from '../../src/';

jest.mock('../../src/utils/db', () => ({
	store: {
		get: () => new Promise(resolve => {
			resolve({
				id: 'c6b3fd61-4d16-44d1-9364-acc9ceb286f3',
				origin: 'http://localhost/',
				timestamp: 1619635510421,
				conf: {
					seller: 'www.ssp.com',
					interest_group_buyers: '*',
					decision_logic_url: 'https://entertaining-glitter-bowler.glitch.me/score.js',
				},
				bid: {
					_key: 'www.rp.com-womens-running-shoes',
					_expired: 1621792745000,
					owner: 'www.rp.com',
					name: 'womens-running-shoes',
					bidding_logic_url: 'https://dark-organic-appeal.glitch.me/bid.js',
					_created: 1619200745000,
					_updated: 1619200745000,
					ad: {
						auction: {},
						browser: {
							top_window_hostname: 'localhost',
							seller: 'www.ssp.com',
						},
						buyer: {},
						interest: {
							_key: 'www.rp.com-womens-running-shoes',
							_expired: 1621792745000,
							owner: 'www.rp.com',
							name: 'womens-running-shoes',
							bidding_logic_url: 'https://dark-organic-appeal.glitch.me/bid.js',
							_created: 1619200745000,
							_updated: 1619200745000,
						},
					},
					bid: 1,
					render: 'https://example.com',
				},
				score: 10,
				_created: 1619635510421,
				_updated: 1619635510421,
			});
		}),
	},
}));

jest.mock('../../src/render/utils', () => ({
	getTarget: () => '<div id="ad-slot-1"></div>',
	renderFrame: () => '<div id="ad-slot-1"><iframe id="fledge-auction-c6b3fd61-4d16-44d1-9364-acc9ceb286f3" src="https://example.com"></iframe></div>',
}));

jest.mock('../../src/reporting/utils', () => ({
	getSellerReport: () => new Promise(resolve => {
		resolve({
			foo: 'bar',
		});
	}),
	getBuyerReport: () => new Promise(resolve => {
		resolve({
			foo: 'bar',
		});
	}),
}));

describe('Render', () => {
	describe('renderAd', () => {
		beforeEach(() => {
			jest.resetModules();
		});

		describe('Return', () => {
			it('should return true when all valid options are provided', async () => {
				// Set up our document body
				document.body.innerHTML = '<div id="ad-slot-1"><iframe id="fledge-auction-c6b3fd61-4d16-44d1-9364-acc9ceb286f3" src="https://example.com"></iframe></div>';
				expect(await fledge.renderAd('#ad-slot-1', 'c6b3fd61-4d16-44d1-9364-acc9ceb286f3')).toBe(true);
			});
		});
	});
});
