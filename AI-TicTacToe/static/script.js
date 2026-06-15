/**
 * AI Tic-Tac-Toe - Complete Frontend Logic
 * Features: Game modes, AI moves, animations, sound, analytics, history
 */

class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill("");
        this.gameMode = "pvp-ai"; // "pvp-ai" or "ai-ai"
        this.difficulty = "hard";
        this.aiXDifficulty = "hard";
        this.aiODifficulty = "hard";
        this.gameActive = true;
        this.playerTurn = true;
        this.aiVsAiRunning = false;
        this.aiVsAiPaused = false;
        this.moveHistory = [];
        this.soundEnabled = true;
        this.darkMode = true;

        // Statistics
        this.stats = this.loadStats();

        // DOM Elements
        this.cells = document.querySelectorAll('.cell');
        this.statusText = document.querySelector('.status-text');
        this.thinkingIndicator = document.getElementById('thinkingIndicator');
        this.moveExplanation = document.getElementById('moveExplanation');
        this.explanationText = document.getElementById('explanationText');
        this.winningLine = document.getElementById('winningLine');
        this.historyList = document.getElementById('historyList');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTheme();
        this.updateScoreboard();
        this.updateStats();
        this.updateAnalytics();
    }

    setupEventListeners() {
        // Cell clicks
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });

        // Mode selector
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setGameMode(e.currentTarget.dataset.mode));
        });

        // Difficulty selector
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setDifficulty(e.currentTarget.dataset.diff));
        });

        // Action buttons
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('undoBtn').addEventListener('click', () => this.undoMove());
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
        document.getElementById('clearStats').addEventListener('click', () => this.clearStats());

        // AI vs AI controls
        document.getElementById('startAiVsAi').addEventListener('click', () => this.startAiVsAi());
        document.getElementById('pauseAiVsAi').addEventListener('click', () => this.pauseAiVsAi());
        document.getElementById('aiXDifficulty').addEventListener('change', (e) => {
            this.aiXDifficulty = e.target.value;
        });
        document.getElementById('aiODifficulty').addEventListener('change', (e) => {
            this.aiODifficulty = e.target.value;
        });
    }

    // ==================== GAME MODE ====================

    setGameMode(mode) {
        this.gameMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        const difficultyPanel = document.getElementById('difficultyPanel');
        const aiVsAiControls = document.getElementById('aiVsAiControls');

        if (mode === 'pvp-ai') {
            difficultyPanel.style.display = 'block';
            aiVsAiControls.style.display = 'none';
            this.stopAiVsAi();
        } else {
            difficultyPanel.style.display = 'none';
            aiVsAiControls.style.display = 'block';
            this.stopAiVsAi();
        }

        this.resetGame();
    }

    setDifficulty(diff) {
        this.difficulty = diff;
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.diff === diff);
        });
        this.resetGame();
    }

    // ==================== CELL CLICK ====================

    handleCellClick(index) {
        if (!this.gameActive || !this.playerTurn || this.board[index] !== "" || this.gameMode !== 'pvp-ai') {
            return;
        }

        // Remove any hints
        this.cells.forEach(cell => cell.classList.remove('hint'));

        // Player move
        this.makeMove(index, 'X');
        this.playSound('move');

        // Check winner
        if (this.checkGameEnd()) return;

        // AI turn
        this.playerTurn = false;
        this.showThinking();

        setTimeout(() => {
            this.makeAiMove();
        }, 600);
    }

    makeMove(index, player) {
        this.board[index] = player;
        const cell = this.cells[index];
        cell.textContent = player;
        cell.classList.add('taken', player.toLowerCase());

        // Add to history
        this.moveHistory.push({ player, index, board: [...this.board] });
        this.updateHistory();
        this.updateAnalytics();
    }

    // ==================== AI MOVE ====================

    async makeAiMove() {
        try {
            const response = await fetch('/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    board: this.board,
                    difficulty: this.difficulty
                })
            });

            const data = await response.json();

            this.hideThinking();

            if (data.ai_move !== -1) {
                this.makeMove(data.ai_move, 'O');
                this.playSound('move');

                // Show explanation
                if (data.explanation) {
                    this.showExplanation(data.explanation);
                }

                // Update analytics
                if (data.analytics) {
                    this.updateAnalytics(data.analytics);
                }
            }

            // Check winner
            if (data.winner) {
                this.handleWinner(data.winner, data.winning_line);
            } else {
                this.playerTurn = true;
                this.updateStatus('Your turn! Click a cell to play.');
            }

        } catch (error) {
            console.error('AI move error:', error);
            this.hideThinking();
            this.updateStatus('Error connecting to AI. Please try again.');
        }
    }

    // ==================== AI vs AI ====================

    async startAiVsAi() {
        this.resetGame();
        this.aiVsAiRunning = true;
        this.aiVsAiPaused = false;

        document.getElementById('startAiVsAi').style.display = 'none';
        document.getElementById('pauseAiVsAi').style.display = 'block';

        let currentPlayer = 'X';

        while (this.aiVsAiRunning && !this.checkWinner()) {
            if (this.aiVsAiPaused) {
                await new Promise(resolve => setTimeout(resolve, 100));
                continue;
            }

            await this.makeAiVsAiMove(currentPlayer);
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

            // Delay between moves for visibility
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        document.getElementById('startAiVsAi').style.display = 'block';
        document.getElementById('pauseAiVsAi').style.display = 'none';
        this.aiVsAiRunning = false;
    }

    async makeAiVsAiMove(player) {
        const difficulty = player === 'X' ? this.aiXDifficulty : this.aiODifficulty;

        try {
            const response = await fetch('/ai-vs-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    board: this.board,
                    current_player: player,
                    difficulty_x: this.aiXDifficulty,
                    difficulty_o: this.aiODifficulty
                })
            });

            const data = await response.json();

            if (data.move !== -1) {
                this.makeMove(data.move, player);
                this.playSound('move');

                if (data.explanation) {
                    this.showExplanation(`${player} AI: ${data.explanation}`);
                }
            }

            if (data.winner) {
                this.handleWinner(data.winner, data.winning_line);
            }

        } catch (error) {
            console.error('AI vs AI error:', error);
        }
    }

    pauseAiVsAi() {
        this.aiVsAiPaused = !this.aiVsAiPaused;
        document.getElementById('pauseAiVsAi').textContent = this.aiVsAiPaused ? 'Resume' : 'Pause';
    }

    stopAiVsAi() {
        this.aiVsAiRunning = false;
        this.aiVsAiPaused = false;
        document.getElementById('startAiVsAi').style.display = 'block';
        document.getElementById('pauseAiVsAi').style.display = 'none';
    }

    // ==================== GAME END ====================

    checkGameEnd() {
        const winner = this.checkWinner();
        if (winner) {
            this.handleWinner(winner);
            return true;
        }
        return false;
    }

    checkWinner() {
        const patterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const pattern of patterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] === this.board[c]) {
                return this.board[a];
            }
        }

        if (!this.board.includes("")) return 'draw';
        return null;
    }

    handleWinner(winner, winningLine = null) {
        this.gameActive = false;

        if (winner === 'draw') {
            this.updateStatus("It's a draw!", 'draw');
            this.playSound('draw');
            this.stats.draws++;
            this.stats.currentStreak = 0;
        } else {
            const isPlayerWin = winner === 'X' && this.gameMode === 'pvp-ai';
            const message = isPlayerWin ? 'You win! 🎉' : `${winner} wins!`;
            const statusClass = isPlayerWin ? 'win' : (winner === 'X' ? 'lose' : 'lose');

            this.updateStatus(message, statusClass);
            this.playSound(isPlayerWin ? 'win' : 'lose');

            // Highlight winning cells
            if (winningLine) {
                winningLine.forEach(idx => {
                    this.cells[idx].classList.add('winning');
                });
                this.drawWinningLine(winningLine);
            }

            // Update stats
            if (winner === 'X') {
                if (this.gameMode === 'pvp-ai') {
                    this.stats.playerWins++;
                    this.stats.currentStreak++;
                    this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.currentStreak);
                } else {
                    this.stats.aiXWins++;
                }
            } else {
                if (this.gameMode === 'pvp-ai') {
                    this.stats.aiWins++;
                    this.stats.currentStreak = 0;
                } else {
                    this.stats.aiOWins++;
                }
            }
        }

        this.stats.totalGames++;
        this.saveStats();
        this.updateScoreboard();
        this.updateStats();
    }

    drawWinningLine(pattern) {
        // Calculate line position
        const cell0 = this.cells[pattern[0]];
        const cell2 = this.cells[pattern[2]];
        const rect0 = cell0.getBoundingClientRect();
        const rect2 = cell2.getBoundingClientRect();
        const boardRect = document.getElementById('gameBoard').getBoundingClientRect();

        const x1 = rect0.left + rect0.width / 2 - boardRect.left;
        const y1 = rect0.top + rect0.height / 2 - boardRect.top;
        const x2 = rect2.left + rect2.width / 2 - boardRect.left;
        const y2 = rect2.top + rect2.height / 2 - boardRect.top;

        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

        this.winningLine.style.display = 'block';
        this.winningLine.style.width = `${length}px`;
        this.winningLine.style.left = `${x1}px`;
        this.winningLine.style.top = `${y1}px`;
        this.winningLine.style.transform = `rotate(${angle}deg)`;
    }

    // ==================== HINT ====================

    async showHint() {
        if (!this.gameActive || !this.playerTurn || this.gameMode !== 'pvp-ai') return;

        try {
            const response = await fetch('/hint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ board: this.board })
            });

            const data = await response.json();

            if (data.hint !== -1) {
                this.cells[data.hint].classList.add('hint');
                this.showExplanation(data.explanation || 'Hint shown!');

                setTimeout(() => {
                    this.cells[data.hint].classList.remove('hint');
                }, 3000);
            }
        } catch (error) {
            console.error('Hint error:', error);
        }
    }

    // ==================== UNDO ====================

    undoMove() {
        if (this.moveHistory.length < 2 || !this.gameActive || this.gameMode !== 'pvp-ai') return;

        // Undo both player and AI moves
        this.moveHistory.pop(); // AI move
        this.moveHistory.pop(); // Player move

        // Restore board
        this.board = this.moveHistory.length > 0 
            ? [...this.moveHistory[this.moveHistory.length - 1].board]
            : Array(9).fill("");

        this.renderBoard();
        this.updateHistory();
        this.updateAnalytics();
        this.playerTurn = true;
        this.updateStatus('Your turn! Click a cell to play.');
        this.hideExplanation();
    }

    renderBoard() {
        this.cells.forEach((cell, index) => {
            cell.textContent = this.board[index];
            cell.className = 'cell';
            if (this.board[index]) {
                cell.classList.add('taken', this.board[index].toLowerCase());
            }
        });
    }

    // ==================== RESET ====================

    resetGame() {
        this.board = Array(9).fill("");
        this.gameActive = true;
        this.playerTurn = true;
        this.moveHistory = [];

        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });

        this.winningLine.style.display = 'none';
        this.hideExplanation();
        this.updateStatus('Your turn! Click a cell to play.');
        this.updateHistory();
        this.updateAnalytics();

        // If AI vs AI mode, don't auto-start
        if (this.gameMode === 'ai-ai') {
            this.stopAiVsAi();
        }
    }

    // ==================== UI UPDATES ====================

    updateStatus(message, className = '') {
        this.statusText.textContent = message;
        this.statusText.className = 'status-text ' + className;
    }

    showThinking() {
        this.thinkingIndicator.style.display = 'flex';
        this.updateStatus('AI is thinking...');
    }

    hideThinking() {
        this.thinkingIndicator.style.display = 'none';
    }

    showExplanation(text) {
        this.explanationText.textContent = text;
        this.moveExplanation.style.display = 'flex';

        setTimeout(() => this.hideExplanation(), 5000);
    }

    hideExplanation() {
        this.moveExplanation.style.display = 'none';
    }

    updateScoreboard() {
        document.getElementById('playerScore').textContent = this.stats.playerWins;
        document.getElementById('drawScore').textContent = this.stats.draws;
        document.getElementById('aiScore').textContent = this.stats.aiWins;

        // Animate score update
        document.querySelectorAll('.score-value').forEach(el => {
            el.classList.add('pop');
            setTimeout(() => el.classList.remove('pop'), 500);
        });
    }

    updateHistory() {
        if (this.moveHistory.length === 0) {
            this.historyList.innerHTML = '<span class="empty-history">No moves yet</span>';
            return;
        }

        this.historyList.innerHTML = this.moveHistory.map((move, i) => `
            <div class="history-item ${move.player.toLowerCase()}">
                ${i + 1}. ${move.player} → ${move.index + 1}
            </div>
        `).join('');

        // Scroll to bottom
        this.historyList.scrollTop = this.historyList.scrollHeight;
    }

    updateAnalytics(data = null) {
        if (data) {
            document.getElementById('availMoves').textContent = data.available_moves;
            document.getElementById('xThreats').textContent = data.x_threats;
            document.getElementById('oThreats').textContent = data.o_threats;
            document.getElementById('centerControl').textContent = 
                data.center_control === '' ? 'Empty' : data.center_control;
        } else {
            const available = this.board.filter(c => c === '').length;
            document.getElementById('availMoves').textContent = available;
            document.getElementById('xThreats').textContent = '0';
            document.getElementById('oThreats').textContent = '0';
            document.getElementById('centerControl').textContent = 
                this.board[4] === '' ? 'Empty' : this.board[4];
        }
    }

    updateStats() {
        document.getElementById('totalGames').textContent = this.stats.totalGames;
        const winRate = this.stats.totalGames > 0 
            ? Math.round((this.stats.playerWins / this.stats.totalGames) * 100) 
            : 0;
        document.getElementById('winRate').textContent = winRate + '%';
        document.getElementById('bestStreak').textContent = this.stats.bestStreak;
        document.getElementById('currentStreak').textContent = this.stats.currentStreak;
    }

    // ==================== THEME ====================

    toggleTheme() {
        this.darkMode = !this.darkMode;
        document.body.classList.toggle('light-mode', !this.darkMode);

        const icon = document.querySelector('.theme-icon');
        icon.textContent = this.darkMode ? '🌙' : '☀️';

        localStorage.setItem('ttt-theme', this.darkMode ? 'dark' : 'light');
    }

    loadTheme() {
        const saved = localStorage.getItem('ttt-theme');
        if (saved === 'light') {
            this.darkMode = false;
            document.body.classList.add('light-mode');
            document.querySelector('.theme-icon').textContent = '☀️';
        }
    }

    // ==================== SOUND ====================

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const icon = document.querySelector('.sound-icon');
        icon.textContent = this.soundEnabled ? '🔊' : '🔇';
    }

    playSound(type) {
        if (!this.soundEnabled) return;

        // Create oscillator-based sounds
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        switch(type) {
            case 'move':
                oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.2);
                break;
            case 'win':
                oscillator.frequency.setValueAtTime(523, audioCtx.currentTime);
                oscillator.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(784, audioCtx.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.4);
                break;
            case 'lose':
                oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.3);
                break;
            case 'draw':
                oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.2);
                break;
        }
    }

    // ==================== STATISTICS ====================

    loadStats() {
        const saved = localStorage.getItem('ttt-stats');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            playerWins: 0,
            aiWins: 0,
            draws: 0,
            totalGames: 0,
            bestStreak: 0,
            currentStreak: 0,
            aiXWins: 0,
            aiOWins: 0
        };
    }

    saveStats() {
        localStorage.setItem('ttt-stats', JSON.stringify(this.stats));
    }

    clearStats() {
        this.stats = {
            playerWins: 0, aiWins: 0, draws: 0,
            totalGames: 0, bestStreak: 0, currentStreak: 0,
            aiXWins: 0, aiOWins: 0
        };
        this.saveStats();
        this.updateScoreboard();
        this.updateStats();
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new TicTacToeGame();
});
