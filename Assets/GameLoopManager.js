class GameLoopManager {
	constructor(userGame, gravity, handleTouchStart, handleTouchEnd, handleTouchMove, handleComputerArrows, resetClicked, togglePlayButton, xClicked) {
		this.userGame = userGame;
		this.gravityTick = null;
		this.running = false;
		this.paused = false;
		this.gravity = gravity;
		this.touchStartListener = null;
		this.touchEndListener = null;
		this.touchMoveListener = null;
		this.keyDownListener = null;
		this.handleTouchStart = handleTouchStart;
		this.handleTouchEnd = handleTouchEnd;
		this.handleTouchMove = handleTouchMove;
		this.handleComputerArrows = handleComputerArrows;
		this.resetClicked = resetClicked;
		this.togglePlayButton = togglePlayButton;
		this.xClicked = xClicked;
	}

	start(resetElement, pausePlayElement, xElement) {
		if (this.gravityTick) {
			clearInterval(this.gravityTick);
		}
		// WE NEED TO INSERT THE SPEED UP LOGIC HERE
		// so basically the way i am thinking to do this is to add to the setInterval() callback function
		// a way to check the current timeout value against the one set by the game. If these differ than we need
		// to unattach the interval if the boolean for "swipedown" is true (within this start() function) and 
		// then reattach it with the proper interval length.
		//
		// On top of that we need to pause the timer for one second if the piece has touched down due to the gravity
		// if at the end of the one second timeout the piece is still touching the ground then we solidify the piece
		this.gravityTick = setInterval(() => this.gravity(this.userGame), this.userGame.getTimerLengthFromPieceDrops());
		this.running = true;
		this.paused = false;
		this.attachInputListeners();
		this.attachButtonListeners(resetElement, pausePlayElement, xElement);
	}

	stop(resetElement, pausePlayElement, xElement) {
		if (this.gravityTick) {
			clearInterval(this.gravityTick);
		}
		this.running = false;
		this.detachInputListeners();
		this.detachButtonListeners(resetElement, pausePlayElement, xElement);
	}

	pause() {
		if (!this.running || this.paused) {
			return;
		}
		clearInterval(this.gravityTick);
		this.detachInputListeners();
		this.paused = true;
	}

	resume() {
		if (!this.running || !this.paused) {
			return;
		}
		this.gravityTick = setInterval(() => this.gravity(this.userGame), this.userGame.getTimerLengthFromPieceDrops());
		this.attachInputListeners();
		this.paused = false;
	}

	reset() {
		this.stop();
		this.userGame.resetBoard(); // You should move all the reset logic here
		this.start();
	}

	attachInputListeners() {
		document.addEventListener('touchstart', this.touchStartListener = (e) => this.handleTouchStart(e, this.userGame));
		document.addEventListener('touchend', this.touchEndListener = (e) => this.handleTouchEnd(e, this.userGame));
		document.addEventListener('touchmove', this.touchMoveListener = (e) => this.handleTouchMove(e, this.userGame));
		document.addEventListener('keydown', this.keyDownListener = (e) => this.handleComputerArrows(e, this.userGame));
	}

	detachInputListeners() {
		document.removeEventListener('touchstart', this.touchStartListener);
		document.removeEventListener('touchend', this.touchEndListener);
		document.removeEventListener('touchmove', this.touchMoveListener);
		document.removeEventListener('keydown', this.keyDownListener);
	}

	attachButtonListeners(resetElement, pausePlayElement, xElement) {
		resetElement.addEventListener('touchstart', (event) => this.resetClicked(event, this.userGame));
		resetElement.addEventListener('click', (event) => this.resetClicked(event, this.userGame));
		pausePlayElement.addEventListener('touchstart', (event) => this.togglePlayButton(event, this.userGame));
		pausePlayElement.addEventListener('click', (event) => this.togglePlayButton(event, this.userGame));
		//xElement.addEventListener('touchend', (event) => this.xClicked(event, this.userGame));
		//xElement.addEventListener('click', (event) => this.xClicked(event, this.userGame));
	}

	detachButtonListeners(resetElement, pausePlayElement, xElement) {
		let newReset = resetElement.cloneNode(true);
		resetElement.parentNode.replaceChild(newReset, resetElement);
		let newPausePlay = pausePlayElement.cloneNode(true);
		pausePlayElement.parentNode.replaceChild(newPausePlay, pausePlayElement);
		//let newXButton = xElement.cloneNode(true);
		//xElement.parentNode.replaceChild(newXButton, xElement);
	}
}

export default GameLoopManager;
