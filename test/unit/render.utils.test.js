/* eslint-disable compat/compat */
import fledge from '../../src/';

jest.mock('../../src/utils/db', () => ({
	store: {
		get: () => new Promise(resolve => {
			resolve({
				id: 'c6b3fd61-4d16-44d1-9364-acc9ceb286f3',
				hostname: 'localhost',
			});
		}),
	},
}));

jest.mock('../../src/render/utils', () => ({
	getTarget: () => '<div id="ad-slot-1"></div>',
	renderFrame: () => '<div id="ad-slot-1"><iframe id="fledge-auction-c6b3fd61-4d16-44d1-9364-acc9ceb286f3" src="https://example.com"></iframe></div>',
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
