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
				it('should throw an Error when no options are provided', () => {
					expect(joinAdInterestGroup()).toThrow();
					expect(joinAdInterestGroup({})).toThrow();
				});

				describe('required option parameters', () => {
					it('should throw an Error when no required options are provided', () => {
						expect(joinAdInterestGroup(mockOptionals, mockExpiry)).toThrow();
					});

					it("should throw an Error when no 'owner' is provided", () => {
						const mockOptions = mockAllOptions;
						delete mockOptions.owner;
						expect(joinAdInterestGroup(mockOptions, mockExpiry)).toThrow();
					});

					it("should throw an Error when no 'name' is provided", () => {
						const mockOptions = mockAllOptions;
						delete mockOptions.name;
						expect(joinAdInterestGroup(mockOptions, mockExpiry)).toThrow();
					});

					it("should throw an Error when no 'bidding_logic_url' is provided", () => {
						const mockOptions = mockAllOptions;
						delete mockOptions.bidding_logic_url;
						expect(joinAdInterestGroup(mockOptions, mockExpiry)).toThrow();
					});
				});

				describe('expiry parameter', () => {
					it('should throw an Error when no expiry is provided', () => {
						expect(joinAdInterestGroup(mockAllOptions)).toThrow();
					});

					it('should throw an Error when expiry is set beyond the maximum time allowed', () => {
						expect(joinAdInterestGroup(mockAllOptions, 2 * mockMaxExpiry)).toThrow();
					});

					it('should throw an Error when expiry is not a valid Number', () => {
						expect(joinAdInterestGroup(mockAllOptions, 'mock')).toThrow();
					});
				});

				describe('data structures', () => {
					it('should throw an Error when options is not a valid Object', () => {
						expect(joinAdInterestGroup(true, mockExpiry)).toThrow();
						expect(joinAdInterestGroup(0, mockExpiry)).toThrow();
						expect(joinAdInterestGroup('mock', mockExpiry)).toThrow();
						expect(joinAdInterestGroup(() => { /* noOp */ }, mockExpiry)).toThrow();
						expect(joinAdInterestGroup(null, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'owner' is not a valid URL", () => {
						const mockOptions = {
							...mockAllOptions,
							owner: 'mock',
						};
						expect(joinAdInterestGroup(mockOptions, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'name' is not a valid String", () => {
						const mockOptions = {
							...mockAllOptions,
							name: 0,
						};
						expect(joinAdInterestGroup(mockOptions, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'bidding_logic_url' is not a valid URL", () => {
						const mockOptions = {
							...mockAllOptions,
							bidding_logic_url: 'mock',
						};
						expect(joinAdInterestGroup(mockOptions, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'daily_update_url' is not a valid URL", () => {
						const mockOptions = {
							...mockAllOptions,
							daily_update_url: 'mock',
						};
						expect(joinAdInterestGroup(mockOptions, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'trusted_bidding_signals_url' is not a valid URL", () => {
						const mockOptions = {
							...mockAllOptions,
							trusted_bidding_signals_url: 'mock',
						};
						expect(joinAdInterestGroup(mockOptions, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'trusted_bidding_signals_keys' is not a valid Array of Strings", () => {
						const mockOptions = {
							...mockAllOptions,
							trusted_bidding_signals_keys: 'mock',
						};
						expect(joinAdInterestGroup(mockOptions, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'user_bidding_signals' is not a valid Object", () => {
						const mockOptions = {
							...mockAllOptions,
							user_bidding_signals: 'mock',
						};
						expect(joinAdInterestGroup(mockOptions, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'ads' is not a valid Array of Objects", () => {
						const mockOptions = {
							...mockAllOptions,
							ads: 'mock',
						};
						expect(joinAdInterestGroup(mockOptions, mockExpiry)).toThrow();
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
