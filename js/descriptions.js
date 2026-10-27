//The tweets with text the person wrote
let written_tweets = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//Filter to just the written tweets
	written_tweets = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	}).filter(tweet => tweet.written);

	//Search again in case something was typed
	searchTweets();
}

//  Written tweets containing the search text 
function searchTweets() {
	const search_text = document.getElementById('textFilter').value;
	const matches = search_text == '' ? [] : written_tweets.filter(tweet => tweet.containsText(search_text));
	document.getElementById('searchCount').innerText = matches.length;
	document.getElementById('searchText').innerText = search_text;
	document.getElementById('tweetTable').innerHTML = matches.map((tweet, index) => tweet.getHTMLTableRow(index + 1)).join('');
}

function addEventHandlerForSearch() {
	// input event fires when character is added or removed
	document.getElementById('textFilter').addEventListener('input', searchTweets);
	//Start with a count of 0 and empty table
	searchTweets();
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});