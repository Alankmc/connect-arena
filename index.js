function Game() {
	this.BOARD_SIZE = [1, 1];
	this.WIN_LENGTH = 3;
	this.PLAYER_TIC = ["x" ,"o"];
	this.EMPTY_TIC = " ";
	this.board = [];
	this.boardString = " ";
	// 0 for tie, 1 for player 1, 2 for player 2
	this.whoWon = 0;

	this.numberOfMoves = 0;
	// -1 for idle, 0 for game End, 1 and 2 for players
	this.currentState = -1;

	this.drawBoard = function() {
		var str = "    ";
		var colIndex = 1;
		var lineIndex = 1;
		for (var i = 0; i < this.BOARD_SIZE[1]; i++) {
			if (colIndex < 10) {
				str += " " + colIndex + "  ";
			} else {
				str += colIndex + "  ";	
			}
			colIndex++;
		}
		str += "\n";
		str += "    ";
		for (var i = 0; i < this.BOARD_SIZE[0]; i++) {
			for (var j = 0; j < this.BOARD_SIZE[1]; j++) {
				str += "--- ";
			}
			str += "\n";
			if (lineIndex < 10) {
				str += "  " + lineIndex + " ";
			} else {
				str += " " + lineIndex + " ";
			}
			lineIndex++;
			str += "| "
			for (var j = 0; j < this.BOARD_SIZE[1]; j++) {
				str += this.board[i][j] + " | ";
			}
			str += "\n"
			str += "    ";
			
		}
		for (var j = 0; j < this.BOARD_SIZE[1]; j++) {
			str += "--- ";
		}
		str += "\n";
		str += "    ";

		this.boardString = str;
	    document.getElementById('boardString').innerHTML = str;
	};

	this.nextChar = function(c) {
	    return String.fromCharCode(c.charCodeAt(0) + 1);
	};

	this.hideByIds = function(ids) {
		for (var i = 0; i < ids.length; i++) {
			document.getElementById(ids[i]).style.display = 'none';
		}
	};
	
	this.showByIds = function(ids) {
		for (var i = 0; i < ids.length; i++) {
			document.getElementById(ids[i]).style.display = 'block';
		}
	};


	this.toggleDivsDueToState = function() {
		switch(this.currentState) {
	    	// idle
	    	case -1:
	    		this.hideByIds(['playerTurn', 'gameEnd', 'playerControls', 'inGameControls']);
	    		this.showByIds(['startGameControls']);
	    		break;
	    	// Game end
	    	case 0:
	    		this.hideByIds(['playerTurn', 'playerControls', 'inGameControls']);
	    		this.showByIds(['startGameControls', 'gameEnd']);
	    		break;
	    	case 1:
	    		this.hideByIds(['startGameControls', 'gameEnd']);
			    document.getElementById('playerTurn').innerHTML = "PLAYER 1 turn";

	    		this.showByIds(['playerControls', 'playerTurn', 'inGameControls']);

	    		break;
	    	case 2:
	    		this.hideByIds(['startGameControls', 'gameEnd']);
	    		document.getElementById('playerTurn').innerHTML = "PLAYER 2 turn";
				this.showByIds(['playerControls', 'playerTurn', 'inGameControls']);

	    		break;
	    	default:
	    		break;
	    }

	};

	/* ---------------------------------- 
	*   Checking end game
	*  -----------------------------------
	*/

	this.checkLine = function(line) {
		console.log("Checking Line " + line)
		var combo = 0;
		var comboStart = null;

		for (var i = 0; i < line.length; i++) {
			if (line[i] != this.EMPTY_TIC) {
				if (comboStart == 0) {
					combo++;
					comboStart = time[i];
				} else {
					if (line[i] == comboStart) {
						combo++;
						if (combo >= this.WIN_LENGTH) {
							return true;
						}
					} else {
						combo = 1;
						comboStart = line[i];
					}
				}
			}
		}

		return false;
	};

	// Goes down a cell from the upper right or upper left (evidenced by isForward),
	// and builds a line out of the diagonal
	
	this.buildDiagonal = function(row, col, isForward) {
		console.log("Building diagonal for " + row + ", " + col + ", " + isForward);
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

	this.lookForEnd = function() {
		var col;

		// Looks for lines
		for (var i = 0; i < this.BOARD_SIZE[0]; i++) {
			col = [];
			for (var j = 0; j < this.BOARD_SIZE[1]; j++) {
				col.push(this.board[i][j]);
			}
			// Vertical and Horizontal
			if (this.checkLine(col) || this.checkLine(this.board[i])) {
				this.whoWon = this.currentState;
				// this.currentState = 0;
				return true;
			}
		}

		// Compare diagonals
		// Build diagonals going down the vertical sides
		for (var i = 0; i < this.BOARD_SIZE[0] - this.WIN_LENGTH + 1; i++) {
			
			if (this.checkLine(this.buildDiagonal(i, 0, true)) || 
				this.checkLine(this.buildDiagonal(i, this.BOARD_SIZE[1] - 1, false))) {
				this.whoWon = this.currentState;
			
				return true;
			}
		}
		// Build diagonals going down the horizontal sides
		for (var i = 1; i < this.BOARD_SIZE[1] - this.WIN_LENGTH + 1; i++) {
			if (this.checkLine(this.buildDiagonal(0, i, true)) || 
				this.checkLine(this.buildDiagonal(0, this.BOARD_SIZE[1] - 1 - i, false))) {
				this.whoWon = this.currentState;

				return true;
			}
		}

		// Tie game
		if (this.numberOfMoves == this.BOARD_SIZE[0] * this.BOARD_SIZE[1]) {
			this.whoWon = 0;
			return true;
		}

		return false;
	};

/* ----------------------------------------*/
	this.playerMove = function(player, row, col) {
		
		this.numberOfMoves++;
		this.board[row][col] = this.PLAYER_TIC[player - 1];
		if (this.lookForEnd()) {
			if (this.whoWon == 0) {
		    	document.getElementById('gameEnd').innerHTML = "TIE!";
		    } else {
			    document.getElementById('gameEnd').innerHTML = "PLAYER " + this.whoWon + " WINS!";
		    }
		    this.currentState = 0;
		} else {
			if (this.currentState == 1) {
				this.currentState = 2;
			} else {
				this.currentState = 1;
			}
		}
		this.drawBoard();
		this.toggleDivsDueToState();
	};

	// Return negative number if incorrect
	this.getPositiveNum = function(str) {
		var num = parseInt(str, 10);

		if (isNaN(num)) {
			return -1;
		}
		return num;
	};

	this.playerPutInCoords = function() {
	    var row = document.getElementById('playerInputRow').value;
	    var col = document.getElementById('playerInputCol').value;
	    row = this.getPositiveNum(row);
	    col = this.getPositiveNum(col);
	    // console.log(row)
	    // console.log(col)
	    // console.log(row)

	    // Indexing starts with 0! Decrement
	    row--;
	    col--;

	    if ( row < 0 || col < 0 || row >= this.BOARD_SIZE[0] || col >= this.BOARD_SIZE[1]) {
    		this.showByIds(['wrongCoords']);
	    	return;
	    }

		if (this.board[row][col] != this.EMPTY_TIC) {
			// console.log("here")
			this.showByIds(['wrongCoords']);
	    	return;	
		}

		this.hideByIds(['wrongCoords']);
		this.playerMove(this.currentState, row, col);
	};

	this.newGame = function() {
		// Get Board sizes
		var numRows = this.getPositiveNum(document.getElementById('boardInputRows').value);
		var numCols = this.getPositiveNum(document.getElementById('boardInputCols').value);
		var winLength = this.getPositiveNum(document.getElementById('boardInputLength').value);

		if (numRows >= 3 && numCols >= 3 && winLength >= 3 && winLength <= Math.min(numRows, numCols)) {
			this.BOARD_SIZE = [numRows, numCols];
			this.WIN_LENGTH = winLength;
		} else {
			this.showByIds(["wrongParams"]);
			return;
		}
		this.hideByIds(["wrongParams"]);
		this.resetBoard();
		this.currentState = Math.floor(Math.random() * 2) + 1
		this.numberOfMoves = 0;
		this.toggleDivsDueToState();
	};

	this.resetGame = function() {
		this.resetBoard();
		this.currentState = -1;
		this.toggleDivsDueToState();
	};

	this.resetBoard = function() {
		this.board = [];
		for (var i = 0; i < this.BOARD_SIZE[0]; i++) {
			var newLine = [];
			for (var j = 0; j < this.BOARD_SIZE[1]; j++) {
				newLine.push(this.EMPTY_TIC);
			}
			this.board.push(newLine);
		}

		// Make empty board
		this.drawBoard();
	};

	this.init = function() {
		this.resetBoard();
		this.toggleDivsDueToState();
	};
};

game = new Game();
game.init()
























