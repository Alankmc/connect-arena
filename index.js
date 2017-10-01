// =================== HELPER FUNCTIONS =================
// el as in "element"
function el(str) {
	return document.getElementById(str);
};

function hideByIds(ids) {
	for (var i = 0; i < ids.length; i++) {
		document.getElementById(ids[i]).style.display = 'none';
	}
};

function showByIds(ids) {
	for (var i = 0; i < ids.length; i++) {
		document.getElementById(ids[i]).style.display = 'block';
	}
};

// Return negative number if incorrect
function getPositiveNum(str) {
	var num = parseInt(str, 10);

	if (isNaN(num)) {
		return -1;
	}
	return num;
};

/*
	=================== BOARD =======================
*/

function Board(game) {
	this.BOARD_SIZE = [2, 2];
	// Redo this shit
	this.TIC_RESOURCES = ["images/blank3.png", "images/x3.png", "images/o3.png"];
	this.GRID_RESOURCES = ["images/barEndH.png", "images/barMidH.png", "images/barEndV.png", "images/barMidV.png", "images/cross.png"]
	this.board = [];
	this.boardElement = document.getElementById("boardDiv");
	this.PLAYER_TIC = [1, 2];
	this.EMPTY_TIC = 0;
	this.numFilled = 0;
	this.game = game;

	this.insertTic = function(player, row, col) {
		this.board[row][col] = player;
		var tic = el("boardCell_" + row + "_" + col);

		tic.src = this.TIC_RESOURCES[player];
		// tic.onclick = null;
		this.numFilled++;
	};

	this.createBoardNodes = function() {
		this.numFilled = 0;

		var boardDiv = document.createElement("div");
		var game = this.game;

		boardDiv.id = "boardDiv";
		boardDiv.style["line-height"] = 0;

		for (var i = 0; i < this.BOARD_SIZE[0]; i++) {
			for (var j = 0; j < this.BOARD_SIZE[1]; j++) {
				var thisBar = new Image();

				if (i == 0) {
					// First line, bar End must point upward
					thisBar.src = this.GRID_RESOURCES[2];
				} else if ( i == this.BOARD_SIZE[0] - 1) {
					// Last line, bar End must point downward
					thisBar.src = this.GRID_RESOURCES[2];
					thisBar.style.transform = "rotate(180deg)"; 
				} else {
					// Middle
					thisBar.src = this.GRID_RESOURCES[3];
				}

				// Tic Image
				var newImg = document.createElement("img");
				
				newImg.id = "boardCell_"+i+"_"+j;
				newImg.src = this.TIC_RESOURCES[0];
				newImg.row = i;
				newImg.col = j;
				// Event listener that self defeats
				newImg.addEventListener("click", function blankListener() {
					// game.clickedCell(this.row, this.col);
					game.clickedCell(this.row, this.col);
					this.removeEventListener("click", blankListener);
				}, false);

				// Append images. First, bar
				if (j != 0) {
					boardDiv.appendChild(thisBar);
				}
				boardDiv.appendChild(newImg);
			}

			// Now, make horizontal bars
			if (i != this.BOARD_SIZE[0] - 1) {
				boardDiv.appendChild(document.createElement("br"));
				for (var j = 0; j < this.BOARD_SIZE[1]; j++) {
					var thisBar = new Image();
					var thisCross = new Image();
					thisCross.src = this.GRID_RESOURCES[4];

					if (j == 0) {
						thisBar.src = this.GRID_RESOURCES[0];
					} else if (j == this.BOARD_SIZE[1] - 1) {
						thisBar.src = this.GRID_RESOURCES[0];
						thisBar.style.transform = "rotate(180deg)"; 
					} else {
						thisBar.src = this.GRID_RESOURCES[1];
					}

					if (j != 0) {
						boardDiv.appendChild(thisCross);
					}
					boardDiv.appendChild(thisBar);
				}
			}
			boardDiv.appendChild(document.createElement("br"));
		}

		el("boardCell").replaceChild(boardDiv, this.boardElement);
		this.boardElement = boardDiv;
	};

	// Returns the player number for who won, or -1 for not yet won
	this.checkLine = function(line, winLength) {
		console.log("Checking Line " + line + " for " + winLength)
		var comboLength = 0;
		var comboStart = 0;

		for (var i = 0; i < line.length; i++) {
			if (line[i] != this.EMPTY_TIC) {
				if (comboStart == 0) {
					comboLength++;
					comboStart = line[i];
				} else {
					if (line[i] == comboStart) {
						comboLength++;
						if (comboLength >= winLength) {
							return true;
						}
					} else {
						comboLength = 1;
						comboStart = line[i];
					}
				}
			} else {
				comboStart = 0;
				comboLength = 0;
			}
		}

		return false;
	};

	// Goes down a cell from the upper right or upper left (evidenced by isForward),
	// and builds a line out of the diagonal
	this.buildDiagonal = function(row, col, isForward) {
		// console.log("Building diagonal for " + row + ", " + col + ", " + isForward);
		var line = [];
		var bump = isForward ? 1 : -1;
		
		//for (var i = 0; i < this.BOARD_SIZE[0] - row; i++) {
		while(row >= 0 && row < this.BOARD_SIZE[0] && col >= 0 && col < this.BOARD_SIZE[1]) {
			line.push(this.board[row][col]);
			row++;
			col += bump;
		}
		
		return line;
	};

	// Returns the 1 for won, 0 for tie, -1 for not yet won
	this.lookForEnd = function(winLength) {
		var col;
		console.log("Looking for win of: " + winLength);

		// Looks for lines
		// Vertical
		for (var i = 0; i < this.BOARD_SIZE[0]; i++) {

			console.log("wtf man this" + this.board[i].length);

			if (this.checkLine(this.board[i], winLength)) {
				return 1;
			}
		}

		// Horizontal
		for (var i = 0; i < this.BOARD_SIZE[1]; i++) {
			col = [];
			for (var j = 0; j< this.BOARD_SIZE[0]; j++) {
				col.push(this.board[j][i]);	
			}
			
			if (this.checkLine(col, winLength)) {
				return 1;
			}
		}

		// Compare diagonals
		// Build diagonals going down the vertical sides
		for (var i = 0; i < this.BOARD_SIZE[0] - winLength + 1; i++) {
			
			if (this.checkLine(this.buildDiagonal(i, 0, true), winLength) || 
				this.checkLine(this.buildDiagonal(i, this.BOARD_SIZE[1] - 1, false), winLength)) {
				return 1;
			}
		}
		// Build diagonals going down the horizontal sides
		for (var i = 1; i < this.BOARD_SIZE[1] - winLength + 1; i++) {
			if (this.checkLine(this.buildDiagonal(0, i, true), winLength) || 
				this.checkLine(this.buildDiagonal(0, this.BOARD_SIZE[1] - 1 - i, false), winLength)) {
				return 1;
			}
		}

		// Check for tie (after everything, because someone might win at the very last move)
		if (this.numFilled == this.BOARD_SIZE[0] * this.BOARD_SIZE[1]) {
			return 0;
		}

		return -1;
	};

	this.resetBoard = function(numRows = this.BOARD_SIZE[0], numCols = this.BOARD_SIZE[1]) {
		this.board = [];
		this.BOARD_SIZE = [numRows, numCols]
		console.log("Resetboard = " + this.BOARD_SIZE);
		for (var i = 0; i < numRows; i++) {
			var newLine = [];
			for (var j = 0; j < numCols; j++) {
				newLine.push(this.EMPTY_TIC);
			}
			this.board.push(newLine);
		}

		this.createBoardNodes();
	};
}

/* ===================== GAME ===================== */


function Game() {
	this.board = null;
	this.WIN_LENGTH = 3;
	this.whoWon = 0;
	this.numberOfMoves = 0;
	// -1 for idle, 0 for game End, 1 and 2 for players
	this.currentState = -1;

	// Hope this goes away with css....
	this.toggleDivsDueToState = function() {
		switch(this.currentState) {
	    	// idle
	    	case -1:
	    		hideByIds(['playerTurn', 'gameEnd', 'playerControls', 'inGameControls']);
	    		showByIds(['startGameControls']);
	    		break;
	    	// Game end
	    	case 0:
	    		hideByIds(['playerTurn', 'playerControls', 'inGameControls']);
	    		showByIds(['startGameControls', 'gameEnd']);
	    		break;
    		// Player 1
	    	case 1:
	    	case 2:
	    		hideByIds(['startGameControls', 'gameEnd']);
			    el("playerIcon").src = this.board.TIC_RESOURCES[this.currentState];
	    		showByIds(['playerControls', 'playerTurn', 'inGameControls']);
	    		break;
	    	default:
	    		break;
	    }
	};

	this.playerMove = function(player, row, col) {
		
		this.numberOfMoves++;
		this.board.insertTic(player, row, col);
		// this.board[row][col] = this.PLAYER_TIC[player - 1];

		var wonYet = this.board.lookForEnd(this.WIN_LENGTH);
		console.log("== END! " + wonYet)
		if (wonYet >= 0) {
			if (wonYet == 0) {
	    		el('gameEnd').innerHTML = "TIE!";
	    	} else {
	    		this.whoWon = this.currentState;
		    	el('gameEnd').innerHTML = "PLAYER " + this.whoWon + " WINS!";
			}
			this.currentState = 0;
	    } else {
			if (this.currentState == 1) {
				this.currentState = 2;
			} else {
				this.currentState = 1;
			}
		}
		// this.drawBoard();
		this.toggleDivsDueToState();
	};

	this.clickedCell = function(row, col) {

		if (this.currentState == 0 || this.currentState == -1) {
			return;
		}
		this.playerMove(this.currentState, row, col);
	};


	this.newGame = function() {
		// Get Board sizes
		var numRows = getPositiveNum(el('boardInputRows').value);
		var numCols = getPositiveNum(el('boardInputCols').value);
		var winLength = getPositiveNum(el('boardInputLength').value);

		if (numRows >= 3 && numCols >= 3 && winLength >= 3 && winLength <= Math.min(numRows, numCols)) {
			this.board.resetBoard(numRows, numCols);
			this.WIN_LENGTH = winLength;
		} else {
			showByIds(["wrongParams"]);
			return;
		}
		hideByIds(["wrongParams"]);
		
		this.currentState = Math.floor(Math.random() * 2) + 1
		this.numberOfMoves = 0;
		this.toggleDivsDueToState();
	};

	this.resetGame = function() {
		this.board.resetBoard();
		this.currentState = -1;
		this.toggleDivsDueToState();
	};

	this.init = function() {
		this.board = new Board(this);
		this.board.resetBoard();
		this.toggleDivsDueToState();
	};
};

game = new Game();
game.init()
























