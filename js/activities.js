//Returns mean of array
function mean(numbers) {
	return numbers.reduce((sum, number) => sum + number, 0) / numbers.length;
}

//Returns the time, distance, and activity type of each tweet
function distanceValues(tweets) {
	return tweets.map(tweet => ({time: tweet.time, distance: tweet.distance, activityType: tweet.activityType}));
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

	//Only completed events have an activity type and distance
	const completed_tweets = tweet_array.filter(tweet => tweet.source == 'completed_event');

	// Count the tweets of each activity type. Sorted most to least common
	const counts = {};
	for (const tweet of completed_tweets) {
		if (tweet.activityType != 'unknown') {
			counts[tweet.activityType] = (counts[tweet.activityType] || 0) + 1;
		}
	}
	const activity_counts = Object.entries(counts)
		.map(([activityType, count]) => ({activityType: activityType, count: count}))
		.sort((a, b) => b.count - a.count);
	const top_activities = activity_counts.slice(0, 3).map(activity => activity.activityType);

	document.getElementById('numberActivities').innerText = activity_counts.length;
	document.getElementById('firstMost').innerText = top_activities[0];
	document.getElementById('secondMost').innerText = top_activities[1];
	document.getElementById('thirdMost').innerText = top_activities[2];

	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": activity_counts
	  },
	  "mark": "bar",
	  "encoding": {
	    "x": {"field": "activityType", "type": "nominal", "sort": "-y", "title": "activity type"},
	    "y": {"field": "count", "type": "quantitative", "title": "number of Tweets"}
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//Tweets of the three most-tweeted activities
	const top_tweets = completed_tweets.filter(tweet => top_activities.includes(tweet.activityType) && tweet.distance > 0);

	//Which activity was longest and shortest on average, and whether activities were longer on weekends or weekdays
	const mean_distances = top_activities.map(activity => ({
		activity: activity,
		distance: mean(top_tweets.filter(tweet => tweet.activityType == activity).map(tweet => tweet.distance))
	})).sort((a, b) => b.distance - a.distance);
	document.getElementById('longestActivityType').innerText = mean_distances[0].activity;
	document.getElementById('shortestActivityType').innerText = mean_distances[mean_distances.length - 1].activity;
	const is_weekend = tweet => tweet.time.getDay() == 0 || tweet.time.getDay() == 6;
	const weekend_mean = mean(top_tweets.filter(is_weekend).map(tweet => tweet.distance));
	const weekday_mean = mean(top_tweets.filter(tweet => !is_weekend(tweet)).map(tweet => tweet.distance));
	document.getElementById('weekdayOrWeekendLonger').innerText = weekend_mean > weekday_mean ? 'weekends' : 'weekdays';

	//Every distance of the three activities, by day of the week
	const distance_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the distance of each of the three most-tweeted activities by day of the week.",
	  "data": {
	    "values": distanceValues(top_tweets)
	  },
	  "mark": "point",
	  "encoding": {
	    "x": {"field": "time", "timeUnit": "day", "type": "ordinal"},
	    "y": {"field": "distance", "type": "quantitative"},
	    "color": {"field": "activityType", "type": "nominal"}
	  }
	};
	vegaEmbed('#distanceVis', distance_vis_spec, {actions:false});

	// Same graph, but with the mean distance
	const distance_vis_aggregated_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the mean distance of each of the three most-tweeted activities by day of the week.",
	  "data": {
	    "values": distanceValues(top_tweets)
	  },
	  "mark": "point",
	  "encoding": {
	    "x": {"field": "time", "timeUnit": "day", "type": "ordinal"},
	    "y": {"field": "distance", "aggregate": "mean", "type": "quantitative"},
	    "color": {"field": "activityType", "type": "nominal"}
	  }
	};
	vegaEmbed('#distanceVisAggregated', distance_vis_aggregated_spec, {actions:false});

	//Show every activity first, then switch between that and the means each time the button is pressed.
	const all_activities_vis = document.getElementById('distanceVis');
	const means_vis = document.getElementById('distanceVisAggregated');
	const button = document.getElementById('aggregate');
	all_activities_vis.style.display = 'block';
	means_vis.style.display = 'none';
	button.addEventListener('click', function() {
		const show_means = means_vis.style.display == 'none';
		means_vis.style.display = show_means ? 'block' : 'none';
		all_activities_vis.style.display = show_means ? 'none' : 'block';
		button.innerText = show_means ? 'Show all activities' : 'Show means';
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});