`/frame/`
	* connects to the iframe 
	* receives messages 
	* communicates to the real API (`joinAdInterestGroup`, `leaveAdInterestGroup`, `runAdAuction`, and `renderAd`)
	* seems to use the URL fragment to grab the token from `sessionStorage`
