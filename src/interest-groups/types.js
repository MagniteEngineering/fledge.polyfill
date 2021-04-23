export default {
	owner: 'string',
	name: 'string',
	bidding_logic_url: 'url',
	daily_update_url: 'url', // @TODO: support this potentially on the auction, grabbing the latest interest group data, and updating the IDB store with it
	trusted_bidding_signals_url: 'url',
	trusted_bidding_signals_keys: 'array',
	user_bidding_signals: 'object',
	ads: 'array',
};
