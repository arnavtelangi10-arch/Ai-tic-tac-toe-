"""
AI Tic-Tac-Toe Web Application
Flask backend with REST API for game logic and AI moves.
"""

from flask import Flask, render_template, request, jsonify, session
from ai import check_winner, get_best_move, get_move_explanation, evaluate_board_state
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

# In-memory game storage (for AI vs AI and multiplayer sessions)
games = {}


@app.route("/")
def home():
    """Render the main game page."""
    return render_template("index.html")


@app.route("/move", methods=["POST"])
def move():
    """
    Handle player move and AI response.

    Request: {"board": ["X","","",...], "difficulty": "hard"}
    Response: {"board": [...], "winner": null/"X"/"O"/"draw", 
               "ai_move": 5, "explanation": "...", "analytics": {...}}
    """
    data = request.json
    board = data.get("board", [""] * 9)
    difficulty = data.get("difficulty", "hard")

    # Check if player won
    winner = check_winner(board)
    if winner:
        return jsonify({
            "board": board,
            "winner": winner,
            "ai_move": -1,
            "explanation": "",
            "analytics": evaluate_board_state(board)
        })

    # AI makes its move
    ai_move = get_best_move(board, difficulty)

    if ai_move != -1:
        board[ai_move] = "O"

    # Check if AI won
    winner = check_winner(board)

    # Generate explanation
    explanation = ""
    if ai_move != -1:
        explanation = get_move_explanation(board, ai_move, difficulty)

    return jsonify({
        "board": board,
        "winner": winner,
        "ai_move": ai_move,
        "explanation": explanation,
        "analytics": evaluate_board_state(board)
    })


@app.route("/ai-vs-ai", methods=["POST"])
def ai_vs_ai():
    """
    Handle AI vs AI mode - both players are AI.

    Request: {"board": [...], "current_player": "X", "difficulty_x": "hard", "difficulty_o": "hard"}
    Response: {"board": [...], "winner": ..., "move": index, "explanation": "..."}
    """
    data = request.json
    board = data.get("board", [""] * 9)
    current_player = data.get("current_player", "X")
    difficulty_x = data.get("difficulty_x", "hard")
    difficulty_o = data.get("difficulty_o", "hard")

    difficulty = difficulty_x if current_player == "X" else difficulty_o

    # Check current state
    winner = check_winner(board)
    if winner:
        return jsonify({
            "board": board,
            "winner": winner,
            "move": -1,
            "explanation": "",
            "analytics": evaluate_board_state(board)
        })

    # AI makes move
    from ai import get_best_move
    move_idx = get_best_move(board, difficulty)

    if move_idx != -1:
        board[move_idx] = current_player

    winner = check_winner(board)
    explanation = get_move_explanation(board, move_idx, difficulty) if move_idx != -1 else ""

    return jsonify({
        "board": board,
        "winner": winner,
        "move": move_idx,
        "explanation": explanation,
        "analytics": evaluate_board_state(board),
        "next_player": "O" if current_player == "X" else "X"
    })


@app.route("/validate", methods=["POST"])
def validate():
    """
    Validate a board state and check for winner.

    Request: {"board": [...]}
    Response: {"winner": null/"X"/"O"/"draw", "winning_line": [0,1,2] or null}
    """
    board = request.json.get("board", [""] * 9)
    winner = check_winner(board)

    winning_line = None
    if winner and winner != "draw":
        from ai import WIN_PATTERNS
        for pattern in WIN_PATTERNS:
            a, b, c = pattern
            if board[a] == board[b] == board[c] and board[a] == winner:
                winning_line = pattern
                break

    return jsonify({
        "winner": winner,
        "winning_line": winning_line,
        "analytics": evaluate_board_state(board)
    })


@app.route("/analytics", methods=["POST"])
def analytics():
    """
    Get detailed analytics for a board state.

    Request: {"board": [...]}
    Response: Detailed analytics object
    """
    board = request.json.get("board", [""] * 9)
    return jsonify(evaluate_board_state(board))


@app.route("/hint", methods=["POST"])
def hint():
    """
    Get a hint for the best player move.

    Request: {"board": [...]}
    Response: {"hint": 5, "explanation": "..."}
    """
    board = request.json.get("board", [""] * 9)

    # Temporarily treat player as AI to get best move
    from ai import minimax
    _, best_move = minimax(board, 0, float('-inf'), float('inf'), False, "hard")

    explanation = ""
    if best_move != -1:
        # Create explanation from player perspective
        board[best_move] = "X"
        if check_winner(board) == "X":
            explanation = "This move wins the game!"
        else:
            explanation = "This is your optimal move."
        board[best_move] = ""

    return jsonify({
        "hint": best_move,
        "explanation": explanation
    })


@app.route("/health")
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "game": "AI Tic-Tac-Toe"})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
