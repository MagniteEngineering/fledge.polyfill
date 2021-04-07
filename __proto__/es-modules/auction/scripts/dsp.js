export function generate_bid (interestGroup, auction, buyer, bidding, browser) {
	return {
		ad: {
			interest: interestGroup,
		},
		bid: 1,
		render: bidding.render_url,
	}
}

export function report_win(auction, buyer, seller, browser) {
	return {
		foo: 'bar',
		baz: 1,
		qux: ['quux', 10, true ],
		corge: {
			grault: true,
			garply: false,
		},
		waldo: true,
	};
}
