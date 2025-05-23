import Game from './Game.js';
import GameLoopManager from './GameLoopManager.js';
import * as tetriminoModule from './tetriminos.js';

// the main function loop where the updates happen
function main() {
	console.log("Game started!");
	const userGame = new Game();
	gameLoopManager = new GameLoopManager(userGame, gravity, solidifyPiece, handleTouchStart, handleTouchEnd, handleTouchMove, handleComputerArrows, resetClicked, togglePlayButton, xClicked);
	console.log(userGame.gameBoard);
	userGame.addPieceToBoard();
	blitScreen(userGame);

	const submitButton = document.querySelector('.submit-button');
	async function submitPressed(userGame) {
		let userName = document.querySelector('.name-box');
		let postBody = {
			"PlayerId": gameCode,
			"PlayerName": userName.value,
			"PlayerScore": userGame.score,
			"Game": userGame.frames
		}
		await fetch('https://www.girlfriendtetris.com/posthighscore', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(postBody)
		});
		// reattaching all the events for the game
		let reset = document.querySelector('.reset-button');
		let pausePlay = document.querySelector('.play-front');
		let xButton = document.querySelector('.x-button');
		gameLoopManager.start(reset, pausePlay, xButton);
		let highscoreMenu = document.querySelector('.highscore-modal');
		highscoreMenu.style.display = "none";
		userGame.score = 0;
		userGame.frames = [];
	}
	if (window.outerWidth <= 985) {
		submitButton.addEventListener('touchend', () => submitPressed(userGame));
	} else {
		submitButton.addEventListener('click', () => submitPressed(userGame));
	}
	let xButton = document.querySelector('.x-button');
	// determines which event listener to use depending on screen width (to detect mobile users)
	if (window.outerWidth <= 985) {
		xButton.addEventListener('touchend', (event) => xClicked(event, userGame));
	} else {
		xButton.addEventListener('click', (event) => xClicked(event, userGame));
	}
	startNewGame();
	playGame(userGame);
}

function blitScreen(userGame) {
	let board = userGame.gameBoard;
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
	// update the score
	let score = document.querySelector('.score-box');
	score.textContent = userGame.score;
}

function gravity(userGame) {
	userGame.generatePieceOutline();
	let isNewPieceGenerated = userGame.exertGravityOnBoard();
	if (isNewPieceGenerated === 1) {
		blitScreen(userGame);
		return "landed";
	}
	blitScreen(userGame);
	return "falling";
}

async function solidifyPiece(userGame) {
	userGame.clearLines();
	if (userGame.addPieceToBoard() === -1) {
		await endGame(userGame);
		await startNewGame();
	}
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
			blitScreen(userGame);
		}
	}
	if (touchendY === touchstartY && touchEndTime - touchStartTime < 120) {
		// allows the user to rotate a piece before it fully solidifies
		if (userGame.rotatePiece() === -1) {
			userGame.shiftActivePieceUpOne();
			userGame.rotatePiece();
		}
		userGame.generatePieceOutline();
		blitScreen(userGame);
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

	clearTimeout(gameLoopManager.speedUpTimeout);
	gameLoopManager.speedUpTimeout = setTimeout(() => {
		console.log("Speed up activated");
		gameLoopManager.setGravitySpeed(100);
		gameLoopManager.speedUpActive = true;
	}, 500);
}

function handleTouchEnd(event, userGame) {
	// had to put this in here because there was a bug that if you rotate the piece too fast it stops
	// falling entirely, so we keep track of the time between touchEnds to call gravity()
	clearTimeout(gameLoopManager.speedUpTimeout);
	if (gameLoopManager.speedUpActive) {
		console.log("Speed up deactivated");
		gameLoopManager.setGravitySpeed(userGame.getTimerLengthFromPieceDrops());
		gameLoopManager.speedUpActive = false;
	}
	touchEndTime = Date.now();
	event.preventDefault();
	touchendX = event.changedTouches[0].screenX;
	touchendY = event.changedTouches[0].screenY;
	if (event.target.getAttribute("class") !== "reset-button" && event.target.getAttribute("class") !== "reset-front" && event.target.getAttribute("class") !== "toggle-play-button" && event.target.getAttribute("class") !== "play-front" && event.target.getAttribute("class") !== "x-button" && event.target.getAttribute("class") !== "x-front") {
		handleGesture(userGame);
	}
}

function handleTouchMove(event, userGame) {
	console.log("touch move");
	//isSpeedUpEnabled = false;
	event.preventDefault();
	let yDirection = event.changedTouches[0].screenY - touchstartY;
	let xDirection = event.changedTouches[0].screenX - touchstartX;
	let moved = false;
	if (Math.abs(xDirection) >= Math.abs(yDirection)) {
		if (event.changedTouches[0].screenX > lastTouchX + 50) {
			lastTouchX = event.changedTouches[0].screenX;
			moved = userGame.movePieceRight();
			userGame.generatePieceOutline();
			blitScreen(userGame);
		} else if (event.changedTouches[0].screenX < lastTouchX - 50) {
			lastTouchX = event.changedTouches[0].screenX;
			moved = userGame.movePieceLeft();
			userGame.generatePieceOutline();
			blitScreen(userGame);
		}
	}
	if (moved && gameLoopManager.touchDownPending) {
		gameLoopManager.inputAfterTouchDownCount++;

		// Reset lock delay if inputs are below limit and piece is still touching down
		if (gameLoopManager.inputAfterTouchDownCount < gameLoopManager.inputAfterTouchDownLimit) {
			gameLoopManager.clearTouchDownTimeout();
			gameLoopManager.touchDownTimeout = setTimeout(async () => {
				if (userGame.isTouchingDown()) {
					solidifyPiece(userGame);
				}
				gameLoopManager.touchDownPending = false;
				gameLoopManager.touchDownTimeout = null;
			}, 1000);
		} else {
			// If limit exceeded, lock immediately
			solidifyPiece(userGame);
			gameLoopManager.clearTouchDownTimeout();
		}
	}
}

function handleComputerArrows(event, userGame) {
	console.log("computer arrow");
	let moved = false;
	if (event.code === "ArrowLeft") {
		event.preventDefault();
		moved = userGame.movePieceLeft();
		userGame.generatePieceOutline();
		blitScreen(userGame);
	} else if (event.code === "ArrowRight") {
		event.preventDefault();
		moved = userGame.movePieceRight();
		userGame.generatePieceOutline();
		blitScreen(userGame);
	} else if (event.code === "Space") {
		event.preventDefault();
		userGame.slamPiece();
		userGame.generatePieceOutline();
		blitScreen(userGame);
	} else if (event.code === "ArrowUp") {
		event.preventDefault();
		// ensures that if the piece has been placed the user gets the opportunity to rotate it 
		// before it solidifies
		moved = userGame.rotatePiece();
		if (moved === -1) {
			userGame.shiftActivePieceUpOne();
			moved = userGame.rotatePiece();
		}
		userGame.generatePieceOutline();
		blitScreen(userGame);
	} else if (event.code === "ArrowDown") {
		event.preventDefault();
		userGame.generatePieceOutline();
		userGame.exertGravityOnBoard();
		blitScreen(userGame);
	}
	if (moved && gameLoopManager.touchDownPending) {
		gameLoopManager.inputAfterTouchDownCount++;

		// Reset lock delay if inputs are below limit and piece is still touching down
		if (gameLoopManager.inputAfterTouchDownCount < gameLoopManager.inputAfterTouchDownLimit) {
			gameLoopManager.clearTouchDownTimeout();
			gameLoopManager.touchDownTimeout = setTimeout(async () => {
				if (userGame.isTouchingDown()) {
					solidifyPiece(userGame);
				}
				gameLoopManager.touchDownPending = false;
				gameLoopManager.touchDownTimeout = null;
			}, 1000);
		} else {
			// If limit exceeded, lock immediately
			solidifyPiece(userGame);
			gameLoopManager.clearTouchDownTimeout();
		}
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
	let pausePlay = document.querySelector('.play-front');
	let xButton = document.querySelector('.x-button');
	gameLoopManager.stop(reset, pausePlay, xButton);

	// display the pause menu
	let pauseMenu = document.querySelector('.pause-menu-modal');
	pauseMenu.style.display = "initial";
	getHighscores();
}

function playGame(userGame) {
	let reset = document.querySelector('.reset-button');
	let pausePlay = document.querySelector('.play-front');
	let xButton = document.querySelector('.x-button');
	gameLoopManager.start(reset, pausePlay, xButton);
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

// REMOVE postBody AS A PARAM, JUST GET IT DIRECTLY FROM THE GAME VARIABLES INSTEAD OF PASSING IT IN
async function endGame(userGame) {
	// this resets a game session that over (or in progress if the the reset button was clicked)
	let result = await fetch('https://www.girlfriendtetris.com/highscores')
	result = await result.json();
	result.sort((a, b) => Number(b.Score) - Number(a.Score));
	if (result.length < 100) {
		// add score since the highscore list is less than 100
		let highscoreMenu = document.querySelector('.highscore-modal');
		highscoreMenu.style.display = "initial";

		let reset = document.querySelector('.reset-button');
		let pausePlay = document.querySelector('.play-front');
		let xButton = document.querySelector('.x-button');
		gameLoopManager.stop(reset, pausePlay, xButton);
	} else {
		if (Number(result[99].Score) < userGame.score) {
			// display the highscore form and submit a request to the POST endpoint
			let highscoreMenu = document.querySelector('.highscore-modal');
			highscoreMenu.style.display = "initial";

			let reset = document.querySelector('.reset-button');
			let pausePlay = document.querySelector('.play-front');
			let xButton = document.querySelector('.x-button');
			gameLoopManager.stop(reset, pausePlay, xButton);
		} else {
			// delete the gameCode for this game, and don't post, since the score wasn't high enough
			await fetch('https://www.girlfriendtetris.com/deletegame', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ PlayerId: gameCode })
			});
			userGame.score = 0;
			userGame.frames = [];
		}
	}
}

async function resetClicked(event, userGame) {
	userGame.gameBoard = userGame.generateGameboard(20, 10);
	userGame.activePiece = [];
	console.log("clearing frames and score");
	userGame.addPieceToBoard();
	userGame.piecesDropped = 0;
	// TODO, WHEN SCORING IS ADDED MAKE SURE TO DO THE SCORE RESET LOGIC HERE TOO
	await endGame(userGame);
	await startNewGame();
	blitScreen(userGame);
}

// first off I should make something that represents just the tetris logic by itself
// then I need separate logic for blitting the game to the html screen

// what needs to happen here?
// first I need to create arrays that represent the tetris blocks
// then I need to create a DOM manipulator function which will blit the tetriminos to the board

// the next thing that needs to happen is to create the gravity function

// I really hate making more global variables for tracking the event listeners, but it seems like the only good way to
// remove them later
var touchstartX = 0;
var touchstartY = 0;
var touchendX = 0;
var touchendY = 0;
var lastTouchX = 0;
var touchStartTime = 0;
var touchEndTime = 0;
var accumulatedTimeBetweenTouchEnds = 0;
var gameCode = 0;
var gameLoopManager = null;

main();


