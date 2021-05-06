/* eslint-disable compat/compat */
import crypto from 'crypto';
import {
	getEligible,
	uuid,
} from '../../src/frame/auction/utils.js';
import {
	mockIGDb,
} from './interest-groups.mock';

Object.defineProperty(global.self, 'crypto', {
	value: {
		getRandomValues: arr => crypto.randomBytes(arr.length),
	},
});

describe('Auction', () => {
	describe('Utils', () => {
		describe('getEligible', () => {
			it('should return all groups when passed a wildcard', () => {
				const eligible = getEligible(mockIGDb, '*');
				expect(eligible).toHaveLength(2);
				expect(eligible).toHaveLength(mockIGDb.length);
				expect(eligible).toEqual(expect.any(Array));
			});

			it('should return a filtered list when passed a list of owners', () => {
				const eligible = getEligible(mockIGDb, [ 'mock-owner.com' ]);
				expect(eligible).toHaveLength(1);
				expect(eligible).toEqual(expect.any(Array));
			});

			it('should return null when no eligible group is found', () => {
				const eligible = getEligible(mockIGDb, [ 'notfound-owner.com' ]);
				expect(eligible).not.toEqual(expect.any(Array));
				expect(eligible).toBeNull();
			});
		});

		describe('uuid', () => {
			it('should return a valid UUID', () => {
				expect(uuid()).toHaveLength(36);
				expect(uuid()).toEqual(expect.any(String));
				expect(uuid()).toEqual(expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i));
			});
		});
	});
});
