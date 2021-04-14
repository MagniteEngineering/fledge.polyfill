import joinAdInterestGroup from './join';
import {
	mockAllOptions,
	mockExpiry,
	mockMaxExpiry,
	mockOptionals,
} from './mock';

describe('Interest Groups', () => {
	describe('joinAdInterestGroup', () => {
		describe('Errors', () => {
			describe('function parameters', () => {
				it('should throw an Error when no parameters are provided', () => {
					expect(() => joinAdInterestGroup()).toThrow();
				});

				it('should throw an Error when no required options are provided', () => {
					expect(() => joinAdInterestGroup({}, mockExpiry)).toThrow();
					expect(() => joinAdInterestGroup(mockOptionals, mockExpiry)).toThrow();
				});

				describe('expiry parameter', () => {
					it('should throw an Error when no expiry is provided', () => {
						expect(() => joinAdInterestGroup(mockAllOptions)).toThrow();
					});

					it('should throw an Error when expiry is not a valid Number', () => {
						expect(() => joinAdInterestGroup(mockAllOptions, 'mock')).toThrow();
					});

					it('should throw an Error when expiry is set beyond the maximum time allowed', () => {
						expect(() => joinAdInterestGroup(mockAllOptions, 2 * mockMaxExpiry)).toThrow();
					});
				});

				describe('data structures', () => {
					it('should throw an Error when options is not a valid Object', () => {
						expect(() => joinAdInterestGroup(undefined, mockExpiry)).toThrow();
						expect(() => joinAdInterestGroup(true, mockExpiry)).toThrow();
						expect(() => joinAdInterestGroup(0, mockExpiry)).toThrow();
						expect(() => joinAdInterestGroup('mock', mockExpiry)).toThrow();
						expect(() => joinAdInterestGroup(() => { /* noOp */ }, mockExpiry)).toThrow();
						expect(() => joinAdInterestGroup(null, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'owner' is not a valid String", () => {
						const mockOptionsInvalidOwner = {
							...mockAllOptions,
							owner: 0,
						};

						expect(() => joinAdInterestGroup(mockOptionsInvalidOwner, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'name' is not a valid String", () => {
						const mockOptionsInvalidName = {
							...mockAllOptions,
							name: 0,
						};
						expect(() => joinAdInterestGroup(mockOptionsInvalidName, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'bidding_logic_url' is not a valid URL", () => {
						const mockOptionsInvalidBidding = {
							...mockAllOptions,
							bidding_logic_url: 'mock',
						};
						expect(() => joinAdInterestGroup(mockOptionsInvalidBidding, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'daily_update_url' is not a valid URL", () => {
						const mockOptionsInvalidDailyUpdate = {
							...mockAllOptions,
							daily_update_url: 'mock',
						};
						expect(() => joinAdInterestGroup(mockOptionsInvalidDailyUpdate, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'trusted_bidding_signals_url' is not a valid URL", () => {
						const mockOptionsInvalidTrustedSignalsUrl = {
							...mockAllOptions,
							trusted_bidding_signals_url: 'mock',
						};
						expect(() => joinAdInterestGroup(mockOptionsInvalidTrustedSignalsUrl, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'trusted_bidding_signals_keys' is not a valid Array of Strings", () => {
						const mockOptionsInvalidTrustedSignalsKeys = {
							...mockAllOptions,
							trusted_bidding_signals_keys: 'mock',
						};
						expect(() => joinAdInterestGroup(mockOptionsInvalidTrustedSignalsKeys, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'user_bidding_signals' is not a valid Object", () => {
						const mockOptionsInvalidUserSignals = {
							...mockAllOptions,
							user_bidding_signals: 'mock',
						};
						expect(() => joinAdInterestGroup(mockOptionsInvalidUserSignals, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'ads' is not a valid Array", () => {
						const mockOptionsInvalidAds = {
							...mockAllOptions,
							ads: 'mock',
						};
						expect(() => joinAdInterestGroup(mockOptionsInvalidAds, mockExpiry)).toThrow();
					});
				});
			});
		});

		describe('Return', () => {
			it('should return true when all valid options are provided', () => {
				expect(joinAdInterestGroup(mockAllOptions, mockExpiry)).toBe(true);
			});
		});
	});
});
