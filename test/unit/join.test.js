import { fledge } from '../../src/';
import {
	mockAllOptions,
	mockExpiry,
	mockMaxExpiry,
	mockOptionals,
} from './mocks';

describe('Interest Groups', () => {
	describe('joinAdInterestGroup', () => {
		describe('Errors', () => {
			describe('function parameters', () => {
				it('should throw an Error when no parameters are provided', async () => {
					await expect(() => fledge.joinAdInterestGroup()).rejects.toThrow();
				});

				it('should throw an Error when no required options are provided', async () => {
					await expect(() => fledge.joinAdInterestGroup({}, mockExpiry)).rejects.toThrow();
					await expect(() => fledge.joinAdInterestGroup(mockOptionals, mockExpiry)).rejects.toThrow();
				});

				describe('expiry parameter', () => {
					it('should throw an Error when no expiry is provided', async () => {
						await expect(() => fledge.joinAdInterestGroup(mockAllOptions)).rejects.toThrow();
					});

					it('should throw an Error when expiry is not a valid Number', async () => {
						await expect(() => fledge.joinAdInterestGroup(mockAllOptions, 'mock')).rejects.toThrow();
					});

					it('should throw an Error when expiry is set beyond the maximum time allowed', async () => {
						await expect(() => fledge.joinAdInterestGroup(mockAllOptions, 2 * mockMaxExpiry)).rejects.toThrow();
					});
				});

				describe('data structures', () => {
					it('should throw an Error when options is not a valid Object', async () => {
						await expect(() => fledge.joinAdInterestGroup(undefined, mockExpiry)).rejects.toThrow();
						await expect(() => fledge.joinAdInterestGroup(true, mockExpiry)).rejects.toThrow();
						await expect(() => fledge.joinAdInterestGroup(0, mockExpiry)).rejects.toThrow();
						await expect(() => fledge.joinAdInterestGroup('mock', mockExpiry)).rejects.toThrow();
						await expect(() => fledge.joinAdInterestGroup(() => { /* noOp */ }, mockExpiry)).rejects.toThrow();
						await expect(() => fledge.joinAdInterestGroup(null, mockExpiry)).rejects.toThrow();
					});

					it("should throw an Error when 'owner' is not a valid String", async () => {
						const mockOptionsInvalidOwner = {
							...mockAllOptions,
							owner: 0,
						};

						await expect(() => fledge.joinAdInterestGroup(mockOptionsInvalidOwner, mockExpiry)).rejects.toThrow();
					});

					it("should throw an Error when 'name' is not a valid String", async () => {
						const mockOptionsInvalidName = {
							...mockAllOptions,
							name: 0,
						};
						await expect(() => fledge.joinAdInterestGroup(mockOptionsInvalidName, mockExpiry)).rejects.toThrow();
					});

					it("should throw an Error when 'bidding_logic_url' is not a valid URL", async () => {
						const mockOptionsInvalidBidding = {
							...mockAllOptions,
							bidding_logic_url: 'mock',
						};
						await expect(() => fledge.joinAdInterestGroup(mockOptionsInvalidBidding, mockExpiry)).rejects.toThrow();
					});

					it("should throw an Error when 'daily_update_url' is not a valid URL", async () => {
						const mockOptionsInvalidDailyUpdate = {
							...mockAllOptions,
							daily_update_url: 'mock',
						};
						await expect(() => fledge.joinAdInterestGroup(mockOptionsInvalidDailyUpdate, mockExpiry)).rejects.toThrow();
					});

					it("should throw an Error when 'trusted_bidding_signals_url' is not a valid URL", async () => {
						const mockOptionsInvalidTrustedSignalsUrl = {
							...mockAllOptions,
							trusted_bidding_signals_url: 'mock',
						};
						await expect(() => fledge.joinAdInterestGroup(mockOptionsInvalidTrustedSignalsUrl, mockExpiry)).rejects.toThrow();
					});

					it("should throw an Error when 'trusted_bidding_signals_keys' is not a valid Array of Strings", async () => {
						const mockOptionsInvalidTrustedSignalsKeys = {
							...mockAllOptions,
							trusted_bidding_signals_keys: 'mock',
						};
						await expect(() => fledge.joinAdInterestGroup(mockOptionsInvalidTrustedSignalsKeys, mockExpiry)).rejects.toThrow();
					});

					it("should throw an Error when 'user_bidding_signals' is not a valid Object", async () => {
						const mockOptionsInvalidUserSignals = {
							...mockAllOptions,
							user_bidding_signals: 'mock',
						};
						await expect(() => fledge.joinAdInterestGroup(mockOptionsInvalidUserSignals, mockExpiry)).rejects.toThrow();
					});

					it("should throw an Error when 'ads' is not a valid Array", async () => {
						const mockOptionsInvalidAds = {
							...mockAllOptions,
							ads: 'mock',
						};
						await expect(() => fledge.joinAdInterestGroup(mockOptionsInvalidAds, mockExpiry)).rejects.toThrow();
					});
				});
			});
		});

		describe('Return', () => {
			it('should return true when all valid options are provided', async () => {
				const ig = await fledge.joinAdInterestGroup(mockAllOptions, mockExpiry);
				await expect(ig).toBe(true);
			});
		});
	});
});
