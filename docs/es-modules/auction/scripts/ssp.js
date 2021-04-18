/* eslint-disable camelcase */
export function score_ad (ad, bid, auction, scoring, browser) {
	return bid * 10;
}

export function report_result (auction, browser) {
	return {
		foo: 'bar',
		baz: 1,
		qux: [ 'quux', 10, true ],
		corge: {
			grault: true,
			garply: false,
		},
		waldo: true,
	};
}
