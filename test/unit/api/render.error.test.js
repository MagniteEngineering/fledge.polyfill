import { renderFledgeAd } from '../../../src/api/';
import { mockAuctionResults } from '../../mocks/auction.mock';

jest.mock('../../../src/api/utils', () => ({
	frame: {
		create: () => '<div id="ad-slot-1"><iframe id="fledge-auction-c6b3fd61-4d16-44d1-9364-acc9ceb286f3" src="https://example.com"></iframe></div>',
	},
	validate: {
		param: () => true,
	},
	dynamicImport: () => new Promise(resolve => {
		resolve({
			foo: 'bar',
		});
	}),
}));

describe('Render', () => {
	describe('renderFledgeAd', () => {
		beforeEach(() => {
			jest.resetModules();
		});

		describe('Errors', () => {
			it('should throw an Error when the winning ad is not on the same origin', async () => {
				const mockInvalidAuctionResults = {
					...mockAuctionResults,
					origin: 'mock-url',
				};
				sessionStorage.setItem('c6b3fd61-4d16-44d1-9364-acc9ceb286f3', JSON.stringify(mockInvalidAuctionResults));

				// Set up our document body
				document.body.innerHTML = '<div id="ad-slot-1"><iframe id="fledge-auction-mock';
				await expect(() => renderFledgeAd('#ad-slot-1', 'c6b3fd61-4d16-44d1-9364-acc9ceb286f3')).rejects.toThrow();
			});

			it('should throw an Error when the Ad is not found on the page', async () => {
				sessionStorage.setItem('c6b3fd61-4d16-44d1-9364-acc9ceb286f3', JSON.stringify(mockAuctionResults));

				// Set up our document body
				document.body.innerHTML = '<div id="ad-slot-1"><iframe id="fledge-auction-mock';
				await expect(() => renderFledgeAd('#ad-slot-1', 'c6b3fd61-4d16-44d1-9364-acc9ceb286f3')).rejects.toThrow();
			});
		});

		describe('Return', () => {
			it('should return true when all valid options are provided', async () => {
				sessionStorage.setItem('c6b3fd61-4d16-44d1-9364-acc9ceb286f3', JSON.stringify(mockAuctionResults));

				// Set up our document body
				document.body.innerHTML = '<div id="ad-slot-1"><iframe id="fledge-auction-c6b3fd61-4d16-44d1-9364-acc9ceb286f3" src="https://example.com"></iframe></div>';
				expect(await renderFledgeAd('#ad-slot-1', 'c6b3fd61-4d16-44d1-9364-acc9ceb286f3')).toBeUndefined();
			});
		});
	});
});
