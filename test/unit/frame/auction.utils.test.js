/* eslint-disable compat/compat */
import crypto from 'crypto';
import {
	uuid,
} from '../../../src/frame/utils';

Object.defineProperty(global.self, 'crypto', {
	value: {
		getRandomValues: arr => crypto.randomBytes(arr.length),
	},
});

describe('Auction', () => {
	describe('Utils', () => {
		describe('uuid', () => {
			it('should return a valid UUID', () => {
				expect(uuid()).toHaveLength(36);
				expect(uuid()).toEqual(expect.any(String));
				expect(uuid()).toEqual(expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i));
			});
		});
	});
});
