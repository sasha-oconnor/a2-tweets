//Sets the text of every element of the given class
function setClassText(className, text) {
	for (const element of document.getElementsByClassName(className)) {
		element.innerText = text;
	}
}

//Formats a fraction as a percentage with two decimal places
function formatPercent(fraction) {
	return math.format(fraction * 100, {notation: 'fixed', precision: 2}) + '%';
}

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;

	//Find the earliest and latest tweets by their time
	const earliest = tweet_array.reduce((first, tweet) => tweet.time < first.time ? tweet : first);
	const latest = tweet_array.reduce((last, tweet) => tweet.time > last.time ? tweet : last);
	const dateFormat = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
	document.getElementById('firstDate').innerText = earliest.time.toLocaleDateString('en-US', dateFormat);
	document.getElementById('lastDate').innerText = latest.time.toLocaleDateString('en-US', dateFormat);

	//Count the tweets in each category
	const categories = {completed_event: 'completedEvents', live_event: 'liveEvents', achievement: 'achievements', miscellaneous: 'miscellaneous'};
	for (const [source, className] of Object.entries(categories)) {
		const count = tweet_array.filter(tweet => tweet.source == source).length;
		setClassText(className, count);
		setClassText(className + 'Pct', formatPercent(count / tweet_array.length));
	}

	// Count how many include text the person wrote
	const completed_tweets = tweet_array.filter(tweet => tweet.source == 'completed_event');
	const written_count = completed_tweets.filter(tweet => tweet.written).length;
	setClassText('written', written_count);
	setClassText('writtenPct', formatPercent(written_count / completed_tweets.length));
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});