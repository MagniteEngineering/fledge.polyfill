import joinAdInterestGroup from '../join';
import { clearIndexDb } from '../../test-utils';

const msInADay = 86400000;

describe('Interest Groups Integration Test', () => {
	describe('joinAdInterestGroup Local Happy Path', () => {
		const options = {
			owner: 'dsp.example',
			name: 'foo',
			bidding_logic_url: 'https://dsp.example/bidding_logic_url',
			daily_update_url: 'https://dsp.example/daily_update_url',
			trusted_bidding_signals_url: 'https://dsp.example/trusted_bidding_signals_url',
			trusted_bidding_signals_keys: 'foo',
			user_bidding_signals: {
				key: 'value',
			},
			ads: [
				{
					id: 'adid',
					url: 'https://dsp.example/ad_url',
				},
			],
		};
		beforeEach(() => {
			clearIndexDb();
		});
		it('should return true', () => {
			expect(joinAdInterestGroup(options, 30 * msInADay)).toBe(true);
		});
	});
});
