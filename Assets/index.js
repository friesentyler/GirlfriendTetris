import Game from './Game.js';
import * as tetriminoModule from './tetriminos.js';


// the main function loop where the updates happen
function main() {
	console.log("Game started!");
	const userGame = new Game();
	console.log(userGame.gameBoard);
	userGame.addPieceToBoard();
	blitScreen(userGame.gameBoard);
	let reset = document.querySelector('.reset-button');
	function resetClicked(event) {
		userGame.gameBoard = userGame.generateGameboard(20, 10);
		userGame.activePiece = [];
		userGame.addPieceToBoard();
		// TODO, WHEN SCORING IS ADDED MAKE SURE TO DO THE SCORE RESET LOGIC HERE TOO
		blitScreen(userGame.gameBoard);
	}
	reset.addEventListener('touchstart', resetClicked);
	reset.addEventListener('click', resetClicked);
	var gravityTick = setInterval(() => gravity(userGame), 250);

	document.addEventListener('touchstart', function(event) {
		touchStartTime = Date.now();
		event.preventDefault();
		touchstartX = event.changedTouches[0].screenX;
		touchstartY = event.changedTouches[0].screenY;
		lastTouchX = event.changedTouches[0].screenX;
		isSpeedUpEnabled = true;
		handleSpeedUp();
	}, false);

	document.addEventListener('touchend', function(event) {
		touchEndTime = Date.now();
		isSpeedUpEnabled = false;
		handleSlowDown();
		event.preventDefault();
		touchendX = event.changedTouches[0].screenX;
		touchendY = event.changedTouches[0].screenY;
		console.log(event.target.getAttribute("class"));
		if (event.target.getAttribute("class") !== "reset-button" && event.target.getAttribute("class") !== "reset-front") {
			console.log("here")
			handleGesture();
		}
	}, false);

	document.addEventListener('touchmove', function(event) {
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
	}, false);

	function handleSpeedUp() {
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

	function handleSlowDown() {
		clearInterval(gravityTick);
		gravityTick = setInterval(() => gravity(userGame), 250);
	}

	function handleGesture() {
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

	document.addEventListener('keydown', (event) => {
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
	});
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

// first off I should make something that represents just the tetris logic by itself
// then I need separate logic for blitting the game to the html screen

// what needs to happen here?
// first I need to create arrays that represent the tetris blocks
// then I need to create a DOM manipulator function which will blit the tetriminos to the board

// the next thing that needs to happen is to create the gravity function

var touchstartX = 0;
var touchstartY = 0;
var touchendX = 0;
var touchendY = 0;
var lastTouchX = 0;
var isSpeedUpEnabled = false;
var touchStartTime = 0;
var touchEndTime = 0;

main();

