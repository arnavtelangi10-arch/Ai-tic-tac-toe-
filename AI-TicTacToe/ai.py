"""
AI Tic-Tac-Toe Engine
Implements Minimax algorithm with Alpha-Beta pruning for optimal play.
"""

import random
from typing import List, Optional, Tuple

# Game constants
PLAYER = "X"
AI = "O"
EMPTY = ""

# Win patterns (indices)
WIN_PATTERNS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  # Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  # Columns
    [0, 4, 8], [2, 4, 6]              # Diagonals
]


def check_winner(board: List[str]) -> Optional[str]:
    """
    Check if there's a winner or draw.
    Returns: 'X', 'O', 'draw', or None (game ongoing)
    """
    for pattern in WIN_PATTERNS:
        a, b, c = pattern
        if board[a] and board[a] == board[b] == board[c]:
            return board[a]

    if "" not in board:
        return "draw"

    return None


def get_available_moves(board: List[str]) -> List[int]:
    """Get list of empty cell indices."""
    return [i for i, cell in enumerate(board) if cell == ""]


def minimax(board: List[str], depth: int, alpha: int, beta: int, 
            is_maximizing: bool, difficulty: str = "hard") -> Tuple[int, int]:
    """
    Minimax algorithm with Alpha-Beta pruning.

    Args:
        board: Current game board
        depth: Current depth in search tree
        alpha: Best score for maximizing player
        beta: Best score for minimizing player
        is_maximizing: True if AI's turn, False if player's turn
        difficulty: 'easy', 'medium', or 'hard'

    Returns:
        Tuple of (score, best_move_index)
    """
    winner = check_winner(board)

    # Terminal states
    if winner == AI:
        return (10 - depth, -1)
    elif winner == PLAYER:
        return (depth - 10, -1)
    elif winner == "draw":
        return (0, -1)

    available_moves = get_available_moves(board)

    # Easy difficulty: occasional random moves
    if difficulty == "easy" and random.random() < 0.7 and depth == 0:
        return (0, random.choice(available_moves) if available_moves else -1)

    # Medium difficulty: mix of optimal and random
    if difficulty == "medium" and random.random() < 0.2 and depth == 0:
        return (0, random.choice(available_moves) if available_moves else -1)

    if is_maximizing:
        max_eval = float('-inf')
        best_move = -1

        for move in available_moves:
            board[move] = AI
            eval_score, _ = minimax(board, depth + 1, alpha, beta, False, difficulty)
            board[move] = ""  # Undo move

            if eval_score > max_eval:
                max_eval = eval_score
                best_move = move

            alpha = max(alpha, eval_score)
            if beta <= alpha:
                break  # Alpha-beta pruning

        return (max_eval, best_move)

    else:
        min_eval = float('inf')
        best_move = -1

        for move in available_moves:
            board[move] = PLAYER
            eval_score, _ = minimax(board, depth + 1, alpha, beta, True, difficulty)
            board[move] = ""  # Undo move

            if eval_score < min_eval:
                min_eval = eval_score
                best_move = move

            beta = min(beta, eval_score)
            if beta <= alpha:
                break  # Alpha-beta pruning

        return (min_eval, best_move)


def get_best_move(board: List[str], difficulty: str = "hard") -> int:
    """
    Get the best move for the AI.

    Args:
        board: Current game board
        difficulty: 'easy', 'medium', or 'hard'

    Returns:
        Index of best move, or -1 if no moves available
    """
    available_moves = get_available_moves(board)

    if not available_moves:
        return -1

    # Easy: 70% random, 30% optimal
    if difficulty == "easy":
        if random.random() < 0.7:
            return random.choice(available_moves)

    # Medium: 20% random, 80% optimal
    elif difficulty == "medium":
        if random.random() < 0.2:
            return random.choice(available_moves)

    # Hard: Always optimal (Minimax with Alpha-Beta)
    _, best_move = minimax(board, 0, float('-inf'), float('inf'), True, difficulty)
    return best_move if best_move != -1 else random.choice(available_moves)


def get_move_explanation(board: List[str], move: int, difficulty: str) -> str:
    """
    Generate an explanation for why the AI chose a particular move.
    """
    if difficulty == "easy":
        return "AI made a random move (Easy mode)."

    # Check if winning move
    board[move] = AI
    if check_winner(board) == AI:
        board[move] = ""
        return "AI chose this move to WIN the game!"
    board[move] = ""

    # Check if blocking opponent's win
    for pattern in WIN_PATTERNS:
        cells = [board[i] for i in pattern]
        if cells.count(PLAYER) == 2 and cells.count("") == 1:
            blocking_idx = pattern[cells.index("")]
            if blocking_idx == move:
                return "AI blocked your winning move!"

    # Check for fork (creating two winning threats)
    fork_count = 0
    for pattern in WIN_PATTERNS:
        cells = [board[i] for i in pattern]
        if cells.count(AI) == 1 and cells.count("") == 2:
            fork_count += 1
    if fork_count >= 2:
        return "AI created a fork (two ways to win)!"

    # Center control
    if move == 4:
        return "AI took the center for strategic control."

    # Corner control
    if move in [0, 2, 6, 8]:
        return "AI secured a corner position."

    return "AI calculated the optimal move using Minimax algorithm."


def evaluate_board_state(board: List[str]) -> dict:
    """
    Evaluate the current board state for analytics.
    """
    available = get_available_moves(board)
    x_count = board.count("X")
    o_count = board.count("O")

    # Count threats
    x_threats = 0
    o_threats = 0

    for pattern in WIN_PATTERNS:
        cells = [board[i] for i in pattern]
        if cells.count("X") == 2 and cells.count("") == 1:
            x_threats += 1
        if cells.count("O") == 2 and cells.count("") == 1:
            o_threats += 1

    return {
        "available_moves": len(available),
        "x_pieces": x_count,
        "o_pieces": o_count,
        "x_threats": x_threats,
        "o_threats": o_threats,
        "center_control": board[4],
        "corner_control": sum(1 for i in [0, 2, 6, 8] if board[i] == "O")
    }
