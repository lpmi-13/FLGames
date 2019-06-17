# FLGames

## What is it?
FLGames is a package of games I use in class to teach English

For the moment, 4 games are developed :
- Tictactoe
- Soccer
- Car race
- Grammar Gamble

I will append details on each game later since this repositery is also my discovery of Git and it takes me a lot of time trying to make things look nice :)

Note that data for games must be placed in data/ folder. You'll find name-of-the-game-data.txt files for each game. If you have images to use, put them in the data/img/ folder and link them [name-of-my-image.png] in the data files.

Please, note that development is not thoroughly tested since I'm more of an English teacher than a developper. Unit tests are still to be done because I don't know (yet) how to do them. My coding 'style' must be awkward, but I'm doing my best to learn the best approaches (if you have advice, I'm interested!).

I was curious on using AngularJS so that's what I'm doing in this FLGames package. Here again, a lot to learn and time flies by...

All my work is placed under the GNU GPL v3.0 license (found in LICENSE.txt).
All images come from the Open Source Clipart Library and icons from the Font Awesome Icons Library.

## What future for FLGames?

- Cleaner code
- Unit tests
- More games :)
- ...

## How to install it if I'm interested?

```
npm install
```
then
```
npm install -g bower
bower install
```

to run the development environment, you will need grunt.
```
npm install -g grunt
```

Once that's all installed, you should be able to run
```
grunt serve
```
to start up the server on `http://localhost:9001`

## build for production/deployment

to create a production build, you can use
`grunt build`

which will create minified assets in the `/dist` folder.


## download and run locally

On the other hand, you can also download simply the dist/ folder. In this folder, all you have to do to test the games is to open index.html in your browser (tested only in Firefox so far...). Once you understand how it goes, feel free to change the data files found in the... 'data/' folder ;)

A few remarks :
- Topics are lines staring with ':'.
- Tictactoe : 1 word/expression/image per line : You need to have at least 9 different lines for a topic (the 9 squares on the gameboard)
- Car race : questions are in the form : my question :: My answer :: Timer. If no timer, it is 60 seconds by default
- If you link an image in Soccer or Tictactoe (I need to test in Carrace), just make it this way : [myfolder/myimage.png] and put the image in the img/ directory (in the myfolder/ directory). Watchout for the dimensions. It's not thoroughly tested !
- Again, look closely at how my files are constructed before deleting them because this README file is still a little lousy. Sorry...
