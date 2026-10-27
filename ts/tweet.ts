class Tweet {
	private text:string;
	time:Date;

    // matches a link
	private static readonly LINK = /https?:\/\/\S+/g;
	//matches completed activities logged by distance
	private static readonly DISTANCE_ACTIVITY = /^Just (?:completed|posted) an? (\d+(?:\.\d+)?) (km|mi) (.+?) (?:with |- )/;
	//matches completed activities logged by time
	private static readonly TIMED_ACTIVITY = /^Just (?:completed|posted) an? (.+?) in \d/;
	//text that a sport watch added after the " - "
	private static readonly DEFAULT_TEXTS:string[] = ["TomTom MySports Watch"];

	//words to estimate sentiment
	private static readonly POSITIVE_WORDS = new Set<string>([
		"accomplished", "amazing", "awesome", "beautiful", "best", "better", "bliss", "brilliant", "calm", "cheerful",
		"comfortable", "cool", "decent", "energetic", "enjoy", "enjoyed", "enjoying", "excellent", "excited", "fabulous",
		"fantastic", "fast", "faster", "fastest", "favorite", "fine", "fresh", "fun", "glad", "glorious", "glory", "good",
		"gorgeous", "grateful", "great", "happy", "improve", "improved", "improvement", "improving", "incredible", "love",
		"loved", "lovely", "lucky", "motivated", "nice", "peaceful", "perfect", "pleasant", "positive", "powerful", "proud",
		"ready", "refreshing", "relaxed", "satisfied", "smooth", "solid", "steady", "strong", "stronger", "success",
		"successful", "super", "superb", "sweet", "terrific", "thank", "thankful", "win", "wonderful", "wow", "yay",
		"pb", "pr"
	]);
	private static readonly NEGATIVE_WORDS = new Set<string>([
		"ache", "aches", "aching", "annoying", "awful", "bad", "boring", "broken", "brutal", "cold", "cramp", "crap",
		"damn", "dead", "die", "difficult", "disappointed", "disappointing", "dying", "exhausted", "fail", "failed",
		"freezing", "frustrating", "hate", "headache", "horrible", "humid", "hurt", "hurting", "hurts", "injury", "lame",
		"lazy", "mess", "miserable", "nasty", "pain", "painful", "poor", "rough", "sad", "sick", "slow", "slower",
		"slowest", "sore", "stiff", "stress", "struggle", "struggled", "struggling", "stuck", "suffer", "suffering",
		"sucks", "sweaty", "terrible", "tired", "ugh", "ugly", "unfortunately", "weak", "worse", "worst", "wrong",
		"tough", "injured", "cramps", "exhausting"
	]);

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        if (this.text.startsWith("Just completed") || this.text.startsWith("Just posted")) {
            return "completed_event";
        } else if (this.text.startsWith("Watch my")) {
            return "live_event";
        } else if (this.text.startsWith("Achieved a new personal record") || this.text.startsWith("I just set a goal")) {
            return "achievement";
        }
        return "miscellaneous";
    }

    // text after the " - " wehn a person wrote it"
    private get textAfterDash():string {
        const dashIndex = this.text.indexOf(" - ");
        if (dashIndex == -1) {
            return "";
        }
        return this.text.substring(dashIndex + 3).replace(Tweet.LINK, "").replace(/#Runkeeper/g, "").trim();
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        if (this.source != 'completed_event') {
            return false;
        }
        const text = this.textAfterDash;
        return text != "" && !Tweet.DEFAULT_TEXTS.includes(text);
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        return this.textAfterDash;
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //Activities are logged either by distance or by time.
        let activity = "unknown";
        const distanceMatch = this.text.match(Tweet.DISTANCE_ACTIVITY);
        const timedMatch = this.text.match(Tweet.TIMED_ACTIVITY);

        if (distanceMatch) {
            activity = distanceMatch[3];
        } else if (timedMatch) {
            activity = timedMatch[1];
        }
        
        return activity.replace(/ workout$/, "");
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        const match = this.text.match(Tweet.DISTANCE_ACTIVITY);
        if (!match) {
            // Some activities have no distance
            return 0;
        }
        const distance = parseFloat(match[1]);
        // km to mi
        return match[2] == "km" ? distance / 1.609 : distance;
    }

    //Returns whether the tweet contains the search text.
    containsText(searchText:string):boolean {
        const visibleText = this.text.replace(Tweet.LINK, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
        return visibleText.toLowerCase().includes(searchText.toLowerCase());
    }

    // Sentiment rating
    get sentiment():string {
        const words = this.writtenText.toLowerCase().match(/[a-z']+/g) ?? [];
        let score = 0;
        for (const word of words) {
            if (Tweet.POSITIVE_WORDS.has(word)) {
                score++;
            } else if (Tweet.NEGATIVE_WORDS.has(word)) {
                score--;
            }
        }
        if (score > 0) {
            return "positive";
        } else if (score < 0) {
            return "negative";
        }
        return "neutral";
    }

    getHTMLTableRow(rowNumber:number):string {
        // The links need changing to open the RunKeeper activity
        const linkedText = this.text.replace(Tweet.LINK, '<a href="$&" target="_blank" rel="noopener noreferrer">$&</a>');
        // Sentiment color
        const sentiment = this.sentiment;
        const badgeColor = sentiment == "positive" ? "success" : sentiment == "negative" ? "danger" : "secondary";
        return `<tr><th scope="row">${rowNumber}</th><td>${this.activityType}</td><td>${linkedText}</td>` +
            `<td><span class="badge text-bg-${badgeColor}">${sentiment}</span></td></tr>`;
    }
}