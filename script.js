// Game state
let gameActive = false;
let currentPlayer = 'x';
let gameState = ['', '', '', '', '', '', '', '', ''];

// DOM elements
const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('statusText');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const winnerMessage = document.getElementById('winnerMessage');
const winnerTitle = document.getElementById('winnerTitle');
const winnerText = document.getElementById('winnerText');
const playAgainBtn = document.getElementById('playAgainBtn');
const backgroundShapes = document.getElementById('backgroundShapes');

// Winning conditions
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
];

// Status messages
const messages = {
    playerTurn: 'Sekarang lu 🎮',
    botTurn: 'Bot lagi berpikir',
    playerWon: 'lu Menang! 🏆',
    botWon: 'CUPU GK USAH MAIN! 🤖',
    draw: 'Permainan Seri! 🤝'
};

// Create background shapes
function createBackgroundShapes() {
    backgroundShapes.innerHTML = '';
    const shapeCount = 15;
    const colors = ['#4e54c8', '#8f94fb', '#ff6b6b', '#3ae374', '#ff9ff3'];
    
    for (let i = 0; i < shapeCount; i++) {
        const shape = document.createElement('div');
        shape.classList.add('shape');
        
        const size = Math.random() * 80 + 20;
        const posX = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 8;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        shape.style.left = `${posX}%`;
        shape.style.bottom = `-${size}px`;
        shape.style.background = color;
        shape.style.animationDelay = `${delay}s`;
        shape.style.animationDuration = `${duration}s`;
        
        backgroundShapes.appendChild(shape);
    }
}

// Create confetti
function createConfetti() {
    const confettiCount = 150;
    const colors = ['#ffd700', '#ff6b6b', '#4e54c8', '#8f94fb', '#3ae374', '#ff9ff3'];
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        // Random confetti properties
        const size = Math.random() * 10 + 5;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 3;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const rotation = Math.random() * 360;
        const shape = Math.random() > 0.5 ? '50%' : '0%';
        
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.left = `${posX}%`;
        confetti.style.top = `${posY}%`;
        confetti.style.backgroundColor = color;
        confetti.style.transform = `rotate(${rotation}deg)`;
        confetti.style.borderRadius = shape;
        confetti.style.animationDelay = `${delay}s`;
        
        document.body.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            document.body.removeChild(confetti);
        }, 3000 + delay * 1000);
    }
}

// Draw win line
function drawWinLine(combo) {
    const lineElement = document.createElement('div');
    lineElement.classList.add('win-line');
    
    const firstCell = cells[combo[0]].getBoundingClientRect();
    const lastCell = cells[combo[2]].getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    
    // Identify whether it's a row, column, or diagonal
    let isRow = Math.floor(combo[0] / 3) === Math.floor(combo[1] / 3) && Math.floor(combo[0] / 3) === Math.floor(combo[2] / 3);
    let isColumn = combo[0] % 3 === combo[1] % 3 && combo[0] % 3 === combo[2] % 3;
    let isDiagonalDown = combo.toString() === [0,4,8].toString();
    let isDiagonalUp = combo.toString() === [2,4,6].toString();
    
    // Calculate center points relative to the board
    const firstCenterX = firstCell.left + firstCell.width / 2 - boardRect.left;
    const firstCenterY = firstCell.top + firstCell.height / 2 - boardRect.top;
    const lastCenterX = lastCell.left + lastCell.width / 2 - boardRect.left;
    const lastCenterY = lastCell.top + lastCell.height / 2 - boardRect.top;
    
    // Adjust start and end points based on line type for more accurate positioning
    const padding = 10; // Padding from cell edge
    let startX, startY, endX, endY, length, angle;
    
    if (isRow) {
        // Horizontal line for rows
        startX = firstCenterX - padding;
        startY = firstCenterY;
        endX = lastCenterX + padding;
        endY = lastCenterY;
        length = endX - startX;
        angle = 0;
    } else if (isColumn) {
        // Vertical line for columns
        startX = firstCenterX;
        startY = firstCenterY - padding;
        endX = lastCenterX;
        endY = lastCenterY + padding;
        length = endY - startY;
        angle = 90;
    } else if (isDiagonalDown) {
        // Diagonal from top-left to bottom-right
        startX = firstCenterX - padding;
        startY = firstCenterY - padding;
        endX = lastCenterX + padding;
        endY = lastCenterY + padding;
        length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        angle = 45;
    } else if (isDiagonalUp) {
        // Diagonal from bottom-left to top-right
        startX = firstCenterX - padding;
        startY = firstCenterY + padding;
        endX = lastCenterX + padding;
        endY = lastCenterY - padding;
        length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        angle = -45;
    } else {
        // Fallback to standard calculation if pattern not recognized
        startX = firstCenterX;
        startY = firstCenterY;
        endX = lastCenterX;
        endY = lastCenterY;
        length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
    }
    
    lineElement.style.width = `${length}px`;
    lineElement.style.height = '10px';
    lineElement.style.left = `${startX}px`;
    lineElement.style.top = `${startY}px`;
    lineElement.style.transform = `rotate(${angle}deg) scaleX(0)`;
    
    board.appendChild(lineElement);
    
    // Trigger animation
    setTimeout(() => {
        lineElement.style.animation = 'scale-line 0.5s forwards';
    }, 100);
}

// Cell click handler
function cellClick(clickedCellEvent) {
    if (!gameActive) return;
    
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
    
    if (gameState[clickedCellIndex] !== '' || currentPlayer !== 'x') return;
    
    handleCellPlayed(clickedCell, clickedCellIndex);
    const gameResult = handleResultValidation();
    
    if (gameResult.gameOver) {
        handleGameOver(gameResult);
        return;
    }
    
    currentPlayer = 'o';
    statusText.textContent = messages.botTurn;
    
    // Bot plays after a delay
    setTimeout(() => {
        if (!gameActive) return;
        handleBotMove();
    }, 800);
}

// Handle cell played
function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.classList.add(currentPlayer);
}

// Bot move
function handleBotMove() {
    // Easy bot: Random move with some basic intelligence
    let availableMoves = gameState.reduce((acc, cell, index) => {
        if (cell === '') acc.push(index);
        return acc;
    }, []);
    
    if (availableMoves.length === 0) return;
    
    // Check if bot can win in next move (30% chance to make this smart move)
    if (Math.random() < 0.3) {
        for (let move of availableMoves) {
            gameState[move] = 'o';
            const result = checkWinner();
            gameState[move] = '';
            
            if (result.winner === 'o') {
                makeBotMove(move);
                return;
            }
        }
    }
    
    // Check if player can win in next move and block (50% chance to make this smart move)
    if (Math.random() < 0.5) {
        for (let move of availableMoves) {
            gameState[move] = 'x';
            const result = checkWinner();
            gameState[move] = '';
            
            if (result.winner === 'x') {
                makeBotMove(move);
                return;
            }
        }
    }
    
    // Otherwise make a random move
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    const botMoveIndex = availableMoves[randomIndex];
    
    makeBotMove(botMoveIndex);
}

// Make bot move
function makeBotMove(index) {
    const botCell = cells[index];
    gameState[index] = 'o';
    botCell.classList.add('o');
    
    const gameResult = handleResultValidation();
    if (gameResult.gameOver) {
        handleGameOver(gameResult);
        return;
    }
    
    currentPlayer = 'x';
    statusText.textContent = messages.playerTurn;
}

// Check winner
function checkWinner() {
    let roundWon = false;
    let winCombo = null;
    
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        const position1 = gameState[a];
        const position2 = gameState[b];
        const position3 = gameState[c];
        
        if (position1 === '' || position2 === '' || position3 === '') {
            continue;
        }
        
        if (position1 === position2 && position2 === position3) {
            roundWon = true;
            winCombo = winningConditions[i];
            break;
        }
    }
    
    return {
        winner: roundWon ? gameState[winCombo[0]] : null,
        winCombo: winCombo
    };
}

// Handle result validation
function handleResultValidation() {
    const result = checkWinner();
    
    if (result.winner) {
        return {
            gameOver: true,
            winner: result.winner,
            winCombo: result.winCombo
        };
    }
    
    const roundDraw = !gameState.includes('');
    if (roundDraw) {
        return {
            gameOver: true,
            draw: true
        };
    }
    
    return {
        gameOver: false
    };
}

// Handle game over
function handleGameOver(gameResult) {
    gameActive = false;
    resetBtn.disabled = false;
    
    if (gameResult.draw) {
        statusText.textContent = messages.draw;
        winnerTitle.textContent = 'Permainan Seri!';
        winnerText.textContent = 'Cobalah lagi!';
    } else {
        const winner = gameResult.winner === 'x' ? 'Kamu' : 'Bot';
        statusText.textContent = gameResult.winner === 'x' ? messages.playerWon : messages.botWon;
        winnerTitle.textContent = `${winner} Menang!`;
        winnerText.textContent = gameResult.winner === 'x' ? 'Selamat! 🏆' : 'Coba lagi! 🤖';
        
        // Create confetti only if player wins
        if (gameResult.winner === 'x') {
            createConfetti();
        }
    }
    
    // Show winner message after a delay
    setTimeout(() => {
        winnerMessage.classList.add('show');
    }, 1000);
}

// Reset game
function resetGame() {
    gameActive = true;
    currentPlayer = 'x';
    gameState = ['', '', '', '', '', '', '', '', ''];
    statusText.textContent = messages.playerTurn;
    
    // Reset all cells
    cells.forEach(cell => {
        cell.classList.remove('x', 'o');
    });
    
    // Hide winner message
    winnerMessage.classList.remove('show');
    
    // Enable reset button
    resetBtn.disabled = false;
}

// Start game
function startGame() {
    gameActive = true;
    board.classList.add('active');
    startBtn.disabled = true;
    resetBtn.disabled = false;
    statusText.textContent = messages.playerTurn;
}

// Event listeners
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', resetGame);
cells.forEach(cell => cell.addEventListener('click', cellClick));

// Initialize background shapes
createBackgroundShapes();

// Refresh background shapes occasionally
setInterval(createBackgroundShapes, 20000);