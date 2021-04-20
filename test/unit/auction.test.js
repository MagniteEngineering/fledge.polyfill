import { fledge } from '../../src/';
import {
	mockAllOptions,
	mockOptionals,
} from './auction.mock';

describe('Interest Groups', () => {
	describe('runAdAuction', () => {
		describe('Errors', () => {
			describe('function parameters', () => {
				it('should throw an Error when no parameters are provided', async () => {
					await expect(() => fledge.runAdAuction()).rejects.toThrow();
				});

				it('should throw an Error when no required options are provided', async () => {
					await expect(() => fledge.runAdAuction({})).rejects.toThrow();
					await expect(() => fledge.runAdAuction(mockOptionals)).rejects.toThrow();
				});

				describe('data structures', () => {
					it('should throw an Error when options is not a valid Object', async () => {
						await expect(() => fledge.runAdAuction(undefined)).rejects.toThrow();
						await expect(() => fledge.runAdAuction(true)).rejects.toThrow();
						await expect(() => fledge.runAdAuction(0)).rejects.toThrow();
						await expect(() => fledge.runAdAuction('mock')).rejects.toThrow();
						await expect(() => fledge.runAdAuction(() => { /* noOp */ })).rejects.toThrow();
						await expect(() => fledge.runAdAuction(null)).rejects.toThrow();
					});

					it("should throw an Error when 'seller' is not a valid String", async () => {
						const mockOptionsInvalidSeller = {
							...mockAllOptions,
							seller: 0,
						};

						await expect(() => fledge.runAdAuction(mockOptionsInvalidSeller)).rejects.toThrow();
					});

					it("should throw an Error when 'decision_logic_url' is not a valid URL", async () => {
						const mockOptionsInvalidDecision = {
							...mockAllOptions,
							decision_logic_url: 'mock',
						};
						await expect(() => fledge.runAdAuction(mockOptionsInvalidDecision)).rejects.toThrow();
					});

					it("should throw an Error when 'trusted_scoring_signals_url' is not a valid URL", async () => {
						const mockOptionsInvalidTrustedSignalsUrl = {
							...mockAllOptions,
							trusted_scoring_signals_url: 'mock',
						};
						await expect(() => fledge.runAdAuction(mockOptionsInvalidTrustedSignalsUrl)).rejects.toThrow();
					});

					it("should throw an Error when 'interest_group_buyers' is not a valid Array of Strings", async () => {
						const mockOptionsInvalidInterestGroupBuyers = {
							...mockAllOptions,
							interest_group_buyers: 'mock',
						};
						await expect(() => fledge.runAdAuction(mockOptionsInvalidInterestGroupBuyers)).rejects.toThrow();
					});

					it("should throw an Error when 'auction_signals' is not a valid Object", async () => {
						const mockOptionsInvalidAuctionSignals = {
							...mockAllOptions,
							auction_signals: 'mock',
						};
						await expect(() => fledge.runAdAuction(mockOptionsInvalidAuctionSignals)).rejects.toThrow();
					});

					it("should throw an Error when 'seller_signals' is not a valid Object", async () => {
						const mockOptionsInvalidSellerSignals = {
							...mockAllOptions,
							seller_signals: 'mock',
						};
						await expect(() => fledge.runAdAuction(mockOptionsInvalidSellerSignals)).rejects.toThrow();
					});

					it("should throw an Error when 'per_buyer_signals' is not a valid Object", async () => {
						const mockOptionsInvalidPerBuyerSignals = {
							...mockAllOptions,
							per_buyer_signals: 'mock',
						};
						await expect(() => fledge.runAdAuction(mockOptionsInvalidPerBuyerSignals)).rejects.toThrow();
					});

					it("should throw an Error when 'additional_bids' is not a valid Array", async () => {
						const mockOptionsInvalidAdditionalBids = {
							...mockAllOptions,
							additional_bids: 'mock',
						};
						await expect(() => fledge.runAdAuction(mockOptionsInvalidAdditionalBids)).rejects.toThrow();
					});
				});
			});
		});

		describe('Return', () => {
			it('should return true when all valid options are provided', async () => {
				const auction = await fledge.runAdAuction(mockAllOptions);
				await expect(auction).toEqual(expect.any(String));
			});
		});
	});
});
