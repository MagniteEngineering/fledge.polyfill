import leaveAdInterestGroup from './leave';
import {
	mockAllOptions,
	mockExpiry,
	mockOptionals,
} from './mock';

describe('Interest Groups', () => {
	describe('leaveAdInterestGroup', () => {
		describe('Errors', () => {
			describe('function parameters', () => {
				it('should throw an Error when no options are provided', () => {
					expect(leaveAdInterestGroup()).toThrow();
					expect(leaveAdInterestGroup({})).toThrow();
				});

				describe('required option parameters', () => {
					it('should throw an Error when no required options are provided', () => {
						expect(leaveAdInterestGroup(mockOptionals, mockExpiry)).toThrow();
					});

					it("should throw an Error when no 'owner' is provided", () => {
						const mockOptions = mockAllOptions;
						delete mockOptions.owner;
						expect(leaveAdInterestGroup(mockOptions, mockExpiry)).toThrow();
					});

					it("should throw an Error when no 'name' is provided", () => {
						const mockOptions = mockAllOptions;
						delete mockOptions.name;
						expect(leaveAdInterestGroup(mockOptions, mockExpiry)).toThrow();
					});
				});

				describe('data structures', () => {
					it('should throw an Error when options is not a valid Object', () => {
						expect(leaveAdInterestGroup(true, mockExpiry)).toThrow();
						expect(leaveAdInterestGroup(0, mockExpiry)).toThrow();
						expect(leaveAdInterestGroup('mock', mockExpiry)).toThrow();
						expect(leaveAdInterestGroup(() => { /* noOp */ }, mockExpiry)).toThrow();
						expect(leaveAdInterestGroup(null, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'owner' is not a valid URL", () => {
						const mockOptions = {
							...mockAllOptions,
							owner: 'mock',
						};
						expect(leaveAdInterestGroup(mockOptions, mockExpiry)).toThrow();
					});

					it("should throw an Error when 'name' is not a valid String", () => {
						const mockOptions = {
							...mockAllOptions,
							name: 0,
						};
						expect(leaveAdInterestGroup(mockOptions, mockExpiry)).toThrow();
					});
				});
			});
		});

		describe('Return', () => {
			it('should return true when all valid options are provided', () => {
				expect(leaveAdInterestGroup(mockAllOptions, mockExpiry)).toThrow();
			});
		});
	});
});
