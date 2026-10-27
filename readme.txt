--Readme document for Sasha O'Connor, aleksano@uci.edu --

1. How many assignment points do you believe you completed (replace the *'s with your numbers)?

10/10 (+1 bonus)
- 3/3 Summarizing tweets
- 4/4 Identifying the most popular activities
- 3/3 Adding a text search interface
- +1 Bonus: the sentiment of each tweet, which I put in its own Sentiment column on the "What people are saying" page

2. How long, in hours, did it take you to complete this assignment?

Did it over the course of a couple of days, so probably about 7 hours total.

3. What online resources did you consult when completing this assignment? (list sites like StackOverflow or specific URLs for tutorials; describe queries to Generative AI or use of AI-based code completion)

- I used Claude Code to teach me how to use certain functions like the event listener. It also helped remind me how to use Vega-lite, as the lecture slides alone were not enough for me. I also gave it the rubric for the assignment and it told me what points I missed, which allowed me to fix them before turning in the assignment. I called upon it to help me with my ts/js syntax because that was easier than looking up the documentation. If claude suggested any new code, or any code edits, I went through the code with it file by file to understand how it works, and was part of the revision process.
- The positive and negative words in the sentiment bonus come from Hu and Liu's Opinion Lexicon (https://www.cs.uic.edu/~liub/FBS/sentiment-analysis.html#lexicon).
- I also used Claude Code to help me with my comprehension of Vega, Vega-Lite, and math.js, to check how they handle dates, and number formatting.

4. What classmates or other individuals did you consult as part of this assignment? What did you discuss?

I did not discuss this assignment with any other classmates.

5. Is there anything special we need to know in order to run your code?

- Run "tsc -p tsconfig.json" from the main folder first to create js/tweet.js. Then open index.html in a browser, or run live-server.
- Completed tweets count as user-written when the person added text after the " - " that RunKeeper puts in place of its default "with @Runkeeper. Check it out!" text. The text "TomTom MySports Watch" doesn't count, since the watch adds it automatically.
- Distances in kilometers are converted to miles using 1 mi = 1.609 km. Activities logged only by time, such as yoga, have no distance, so they are left out of the distance graphs.
- The search is not case-sensitive and only looks through tweets with user-written text. It skips t.co links, because random letters were matching searches on accident.
- For the bonus, descriptions.html has one extra column header for Sentiment. Each tweet's written text gains a point for every positive word and loses a point for every negative word. A total above zero is positive, a total below zero is negative, and zero is neutral.