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
	userGame.exertGravityOnBoard();
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
	gravityTick = setInterval(() => gravity(userGame), 250);
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
	if (touchendY === touchstartY && touchEndTime - touchStartTime < 100) {
		userGame.rotatePiece();
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
	/*else if (pausePlay.firstElementChild.style.display === "none") {
		// for playing
		pausePlay.firstElementChild.style.display = "initial";
		pausePlay.lastElementChild.style.display = "none";
		console.log("play game");
		playGame(userGame);
	}*/
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
	console.log(event.code);
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
		userGame.generatePieceOutline();
		blitScreen(userGame.gameBoard);
	} else if (event.code === "ArrowUp") {
		event.preventDefault();
		userGame.rotatePiece();
		userGame.generatePieceOutline();
		blitScreen(userGame.gameBoard);
	} else if (event.code === "ArrowDown") {
		event.preventDefault();
		userGame.generatePieceOutline();
		userGame.exertGravityOnBoard();
		blitScreen(userGame.gameBoard);	// add code to speed up the falling here
	}
}

function xClicked(event, userGame) {
	console.log("fired");
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
	// if this isn't commented there's no way to unpause the game
	/*let pausePlay = document.querySelector('.play-front');
	let newPausePlay = pausePlay.cloneNode(true);
	pausePlay.parentNode.replaceChild(newPausePlay, pausePlay);*/

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
	xButton.addEventListener('touchstart', xClickedListener);
	xButton.addEventListener('click', xClickedListener);
}

function playGame(userGame) {
	let reset = document.querySelector('.reset-button');
	function resetClicked(event) {
		userGame.gameBoard = userGame.generateGameboard(20, 10);
		userGame.activePiece = [];
		userGame.addPieceToBoard();
		// TODO, WHEN SCORING IS ADDED MAKE SURE TO DO THE SCORE RESET LOGIC HERE TOO
		blitScreen(userGame.gameBoard);
	}

	reset.addEventListener('touchstart', (event) => resetClicked(event, userGame));
	reset.addEventListener('click', (event) => resetClicked(event, userGame));

	// THE CODE FOR ADDING THESE LISTENERS IS IN THE MAIN(), PROBABLY WILL REMOVE THIS AT SOME POINT?
	/*let pausePlay = document.querySelector('.play-front');
	pausePlay.addEventListener('touchstart', (event) => togglePlayButton(event, userGame));
	pausePlay.addEventListener('click', (event) => togglePlayButton(event, userGame));*/
	gravityTick = setInterval(() => gravity(userGame), 250);

	document.addEventListener('touchstart', touchStartListener = (event) => handleTouchStart(event, userGame), false);
	document.addEventListener('touchend', touchEndListener = (event) => handleTouchEnd(event, userGame), false);
	document.addEventListener('touchmove', touchMoveListener = (event) => handleTouchMove(event, userGame), false);
	document.addEventListener('keydown', keyDownListener = (event) => handleComputerArrows(event, userGame));

	// remove the x button listeners
	let xButton = document.querySelector('.x-button');
	xButton.removeEventListener('touchstart', xClickedListener);
	xButton.removeEventListener('click', xClickedListener);
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

main();

