zID: z5387241
Chosen bonus feature(s): Hangman and Databases


Explanation (~100 words):



1.Hangman:


l create two new routes named hangman/start/v1 and hangman/end/v1.These routes only can control the start and end of hangman. l mainly rely on messages to present the status of hangman game. For the backend, l create a specific file called hangmanlib to store all functions about hangman.For frontend, l add two paths named HANGMAN_START and HANGMAN_END at src/utils/path.js. In addion, l add two buttons at channel page to start or end hangman so l modify code at src/components/channel/index.js.



2. databases:


I have a cloud database service provided by AWS to achieve remote connection to my MySQL database. I created 7 entities at entity folder to construct my database and there are imformation about mysql including database name, password, host and more at src/data-source file. I had to modify almost all previous functions because the data structure we used in the previous iteration was not suitable for constructing the database directly. I abandoned some unnecessary functions that did not affect the normal running of the new routes to reduce my workload.


Link to Flipgrid video: https://flip.com/s/b2Dg2iEzz2qW

