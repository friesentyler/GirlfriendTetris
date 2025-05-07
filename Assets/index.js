import Game from './Game.js';
import * as tetriminoModule from './tetriminos.js';


// the main function loop where the updates happen
function main() {
	console.log("Game started!");
	const userGame = new Game();
	console.log(userGame.gameBoard);
	userGame.addPieceToBoard();
	blitScreen(userGame.gameBoard);

	// THIS CODE ONLY MAKES SURE THAT THE PAUSE PLAY BUTTON ALWAYS WORKS, POSSIBLY REMOVE LATER
	let pausePlay = document.querySelector('.play-front');
	pausePlay.addEventListener('touchstart', (event) => togglePlayButton(event, userGame));
	pausePlay.addEventListener('click', (event) => togglePlayButton(event, userGame));
	// END

	startNewGame();
	playGame(userGame);
}

function blitScreen(board) {
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board[0].length; j++) {
			let block = document.getElementById(`${i}-${j}`);
			if (board[i][j] === 1) {
				block.style.backgroundColor = 'hsl(350, 100%, 38%)';
			} else if (board[i][j] === 2) {
				block.style.backgroundColor = 'hsl(245, 100%, 50%)';
			} else if (board[i][j] === 3) {
				block.style.backgroundColor = 'hsl(280, 100%, 50%)';
			} else if (board[i][j] === 4) {
				block.style.backgroundColor = 'hsl(20, 100%, 50%)';
			} else if (board[i][j] === 5) {
				block.style.backgroundColor = 'hsl(320, 100%, 50%)';
			} else if (board[i][j] === 6) {
				block.style.backgroundColor = 'hsl(210, 100%, 50%)';
			} else if (board[i][j] === 7) {
				block.style.backgroundColor = 'hsl(90, 100%, 30%)';
			} else if (board[i][j] === -1) {
				block.style.backgroundColor = 'hsl(0, 100%, 5%)';
			} else {
				block.style.removeProperty('background-color');
			}
		}
	}
}

function gravity(userGame) {
	userGame.generatePieceOutline();
	let isNewPieceGenerated = userGame.exertGravityOnBoard();
	if (isNewPieceGenerated === 1) {
		clearInterval(gravityTick);
		setTimeout(() => {
			if (userGame.exertGravityOnBoard() === 1) {
				userGame.clearLines();
				if (userGame.addPieceToBoard() === -1) {
					endGame();
					startNewGame();
				}
				timeRemainingForActivePieceToSolidify = 1000;
				handleSlowDown(userGame);
			} else {
				timeRemainingForActivePieceToSolidify -= timeRemainingForActivePieceToSolidify / 4
				handleSlowDown(userGame);
			}
		}, timeRemainingForActivePieceToSolidify)

	}
	blitScreen(userGame.gameBoard);
}

function handleSpeedUp(userGame) {
	// so this gets triggered when a touch start is fired
	// if there is no touchmoves fired within a certain duration of time we assume the player
	// wants to speed up the piece falling
	// just reset the gravityTick interval to a different duration
	setTimeout(() => {
		if (isSpeedUpEnabled) {
			clearInterval(gravityTick);
			gravityTick = setInterval(() => gravity(userGame), 100);
		}
	}, 500)
}

function handleSlowDown(userGame) {
	clearInterval(gravityTick);
	gravityTick = setInterval(() => gravity(userGame), userGame.getTimerLengthFromPieceDrops());
}

function handleGesture(userGame) {
	let xDirection = touchendX - touchstartX;
	let yDirection = touchendY - touchstartY;
	if (Math.abs(xDirection) < Math.abs(yDirection)) {
		if (touchendY < touchstartY) {
			console.log('swipe up');
		} else if (touchendY > touchstartY) {
			userGame.slamPiece();
			userGame.generatePieceOutline();
			blitScreen(userGame.gameBoard);
		}
	}
	if (touchendY === touchstartY && touchEndTime - touchStartTime < 120) {
		// allows the user to rotate a piece before it fully solidifies
		if (userGame.rotatePiece() === -1) {
			userGame.shiftActivePieceUpOne();
			userGame.rotatePiece();
		}
		userGame.generatePieceOutline();
		blitScreen(userGame.gameBoard);
	}
}

function togglePlayButton(event, userGame) {
	let pausePlay = document.querySelector('.play-front');
	if (pausePlay.lastElementChild.style.display === "none") {
		// for pausing
		pausePlay.firstElementChild.style.display = "none";
		pausePlay.lastElementChild.style.display = "initial";
		pauseGame(userGame);
	}
}

function handleTouchStart(event, userGame) {
	touchStartTime = Date.now();
	event.preventDefault();
	touchstartX = event.changedTouches[0].screenX;
	touchstartY = event.changedTouches[0].screenY;
	lastTouchX = event.changedTouches[0].screenX;
	isSpeedUpEnabled = true;
	handleSpeedUp(userGame);
}

function handleTouchEnd(event, userGame) {
	// had to put this in here because there was a bug that if you rotate the piece too fast it stops
	// falling entirely, so we keep track of the time between touchEnds to call gravity()
	if (Date.now() - touchEndTime < 250) {
		accumulatedTimeBetweenTouchEnds += (Date.now() - touchEndTime)
		if (accumulatedTimeBetweenTouchEnds > 250) {
			accumulatedTimeBetweenTouchEnds = 0;
			gravity(userGame);
		}
	}
	touchEndTime = Date.now();
	isSpeedUpEnabled = false;
	handleSlowDown(userGame);
	event.preventDefault();
	touchendX = event.changedTouches[0].screenX;
	touchendY = event.changedTouches[0].screenY;
	if (event.target.getAttribute("class") !== "reset-button" && event.target.getAttribute("class") !== "reset-front" && event.target.getAttribute("class") !== "toggle-play-button" && event.target.getAttribute("class") !== "play-front" && event.target.getAttribute("class") !== "x-button" && event.target.getAttribute("class") !== "x-front") {
		handleGesture(userGame);
	}
}

function handleTouchMove(event, userGame) {
	isSpeedUpEnabled = false;
	event.preventDefault();
	let yDirection = event.changedTouches[0].screenY - touchstartY;
	let xDirection = event.changedTouches[0].screenX - touchstartX;
	if (Math.abs(xDirection) >= Math.abs(yDirection)) {
		if (event.changedTouches[0].screenX > lastTouchX + 50) {
			lastTouchX = event.changedTouches[0].screenX;
			userGame.movePieceRight();
			userGame.generatePieceOutline();
			blitScreen(userGame.gameBoard);
		} else if (event.changedTouches[0].screenX < lastTouchX - 50) {
			lastTouchX = event.changedTouches[0].screenX;
			userGame.movePieceLeft();
			userGame.generatePieceOutline();
			blitScreen(userGame.gameBoard);
		}
	}
}

function handleComputerArrows(event, userGame) {
	//console.log(event.code);
	if (event.code === "ArrowLeft") {
		event.preventDefault();
		userGame.movePieceLeft();
		userGame.generatePieceOutline();
		blitScreen(userGame.gameBoard);
	} else if (event.code === "ArrowRight") {
		event.preventDefault();
		userGame.movePieceRight();
		userGame.generatePieceOutline();
		blitScreen(userGame.gameBoard);
	} else if (event.code === "Space") {
		event.preventDefault();
		userGame.slamPiece();
		// have to add this so that the timer function gets updated with the new timeout value
		// when the player advances to the next level
		handleSlowDown(userGame);
		userGame.generatePieceOutline();
		blitScreen(userGame.gameBoard);
	} else if (event.code === "ArrowUp") {
		event.preventDefault();
		// ensures that if the piece has been placed the user gets the opportunity to rotate it 
		// before it solidifies
		if (userGame.rotatePiece() === -1) {
			userGame.shiftActivePieceUpOne();
			userGame.rotatePiece();
		}
		userGame.generatePieceOutline();
		blitScreen(userGame.gameBoard);
	} else if (event.code === "ArrowDown") {
		event.preventDefault();
		// have to add this so that the timer function gets updated with the new timeout value
		// when the player advances to the next level
		handleSlowDown(userGame);
		userGame.generatePieceOutline();
		userGame.exertGravityOnBoard();
		blitScreen(userGame.gameBoard);	// add code to speed up the falling here
	}
}

function xClicked(event, userGame) {
	let pauseMenu = document.querySelector('.pause-menu-modal');
	let pausePlay = document.querySelector('.play-front');
	pauseMenu.style.display = "none";
	pausePlay.firstElementChild.style.display = "initial";
	pausePlay.lastElementChild.style.display = "none";
	playGame(userGame);
}

function pauseGame(userGame) {
	let reset = document.querySelector('.reset-button');
	let newReset = reset.cloneNode(true);
	reset.parentNode.replaceChild(newReset, reset);

	clearInterval(gravityTick);
	// notice that the functions we remove on these events are named arrow functions, the names are global
	// variables defined at the bottom of the file. Could possibly have weird side effects later
	document.removeEventListener("touchstart", touchStartListener, false);
	document.removeEventListener('touchend', touchEndListener, false);
	document.removeEventListener('touchmove', touchMoveListener, false);
	document.removeEventListener('keydown', keyDownListener);

	// display the pause menu
	let pauseMenu = document.querySelector('.pause-menu-modal');
	pauseMenu.style.display = "initial";
	let xButton = document.querySelector('.x-button');
	xClickedListener = (event) => xClicked(event, userGame);
	xButton.addEventListener('touchend', xClickedListener);
	xButton.addEventListener('click', xClickedListener);
	getHighscores();
}

function playGame(userGame) {
	let reset = document.querySelector('.reset-button');
	async function resetClicked(event) {
		userGame.gameBoard = userGame.generateGameboard(20, 10);
		userGame.activePiece = [];
		userGame.addPieceToBoard();
		userGame.piecesDropped = 0;
		// TODO, WHEN SCORING IS ADDED MAKE SURE TO DO THE SCORE RESET LOGIC HERE TOO
		endGame();
		startNewGame();
		blitScreen(userGame.gameBoard);
	}

	reset.addEventListener('touchstart', (event) => resetClicked(event, userGame));
	reset.addEventListener('click', (event) => resetClicked(event, userGame));

	gravityTick = setInterval(() => gravity(userGame), userGame.getTimerLengthFromPieceDrops());

	document.addEventListener('touchstart', touchStartListener = (event) => handleTouchStart(event, userGame), false);
	document.addEventListener('touchend', touchEndListener = (event) => handleTouchEnd(event, userGame), false);
	document.addEventListener('touchmove', touchMoveListener = (event) => handleTouchMove(event, userGame), false);
	document.addEventListener('keydown', keyDownListener = (event) => handleComputerArrows(event, userGame));

	// remove the x button listeners
	let xButton = document.querySelector('.x-button');
	xButton.removeEventListener('touchend', xClickedListener);
	xButton.removeEventListener('click', xClickedListener);
}

async function getHighscores() {
	let result = await fetch('https://www.girlfriendtetris.com/highscores');
	result = await result.json();
	result.sort((a, b) => Number(b.Score) - Number(a.Score));
	// removes all the highscores first
	let scoresFlex = document.querySelector('.scores-column-flex-container');
	while (scoresFlex.firstChild) {
		scoresFlex.removeChild(scoresFlex.firstChild);
	}
	// then repopulates the highscores that we retrieved from the DB
	for (let i = 0; i < result.length; i++) {
		let scoreBox = document.createElement('div');
		let playerName = document.createElement('p');
		let playerScore = document.createElement('p');
		scoreBox.classList.add('highscore-box');
		playerName.textContent = result[i].PlayerName;
		playerScore.textContent = result[i].Score;
		scoreBox.appendChild(playerName);
		scoreBox.appendChild(playerScore);
		scoresFlex.appendChild(scoreBox);
	}
}

async function startNewGame() {
	// this is the code which is stored in the database that we use to validate the game
	gameCode = await fetch('https://www.girlfriendtetris.com/startgame');
	gameCode = await gameCode.json();
}

async function endGame(postBody) {
	// this resets a game session that over (or in progress if the the reset button was clicked)
	let result = await fetch('https://www.girlfriendtetris.com/highscores')
	result = await result.json();
	result.sort((a, b) => Number(b.Score) - Number(a.Score));
	if (result.length < 100) {
		// add score since the highscore list is less than 100
	} else {
		if (Number(result[99].Score) < postBody.PlayerScore) {
			// display the highscore form and submit a request to the POST endpoint
		} else {
			// delete the gameCode for this game, and don't post, since the score wasn't high enough
			await fetch('https://www.girlfriendtetris.com/deletegame', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ PlayerId: playerId })
			});
		}
	}
}

// first off I should make something that represents just the tetris logic by itself
// then I need separate logic for blitting the game to the html screen

// what needs to happen here?
// first I need to create arrays that represent the tetris blocks
// then I need to create a DOM manipulator function which will blit the tetriminos to the board

// the next thing that needs to happen is to create the gravity function

// I really hate making more global variables for tracking the event listeners, but it seems like the only good way to
// remove them later
var touchStartListener = null;
var touchEndListener = null;
var touchMoveListener = null;
var keyDownListener = null;
var xClickedListener = null;

var touchstartX = 0;
var touchstartY = 0;
var touchendX = 0;
var touchendY = 0;
var lastTouchX = 0;
var isSpeedUpEnabled = false;
var touchStartTime = 0;
var touchEndTime = 0;
var gravityTick = 0;
var accumulatedTimeBetweenTouchEnds = 0;
var timeRemainingForActivePieceToSolidify = 1000;
var gameCode = 0;

main();


