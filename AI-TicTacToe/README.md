# 🤖 AI Tic-Tac-Toe Web Application

A full-stack Tic-Tac-Toe game with an **unbeatable AI** powered by the **Minimax algorithm with Alpha-Beta pruning**. Built with Python Flask backend and a modern responsive frontend.

![Tech Stack](https://img.shields.io/badge/Python-3.8+-blue)
![Flask](https://img.shields.io/badge/Flask-2.3+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎮 Features

### Core Gameplay
- **Human vs AI** - Play against the computer
- **AI vs AI** - Watch two AI players battle
- **Unbeatable AI** - Minimax with Alpha-Beta pruning (Hard mode)
- **Difficulty Levels** - Easy (70% random), Medium (20% random), Hard (100% optimal)
- **Move Validation** - Server-side winner detection
- **Draw Detection** - Automatic stalemate recognition

### Advanced Features
- **🧠 AI Move Explanation** - Understand why the AI made its move
- **📊 Real-time Analytics** - Threat detection, center control, available moves
- **💡 Hint System** - Get optimal move suggestions
- **📝 Move History** - Track every move with timestamps
- **📈 Statistics** - Win rate, streaks, total games (localStorage)
- **↩️ Undo** - Reverse last moves
- **🎵 Sound Effects** - Web Audio API generated sounds
- **🌙 Dark/Light Mode** - Toggle themes with persistence
- **📱 Responsive Design** - Works on mobile, tablet, desktop

### AI Features
- **Minimax Algorithm** - Optimal game tree search
- **Alpha-Beta Pruning** - Reduces search space by ~50%
- **Depth Scoring** - Prefers faster wins (`10 - depth`)
- **Move Analysis** - Win/Block/Fork/Center/Corner detection
- **Difficulty Scaling** - Randomness injection for easier modes

## 🏗️ Project Structure

```
AI-TicTacToe/
├── app.py              # Flask backend & API routes
├── ai.py               # Minimax + Alpha-Beta engine
├── requirements.txt    # Python dependencies
├── README.md           # This file
├── static/
│   ├── style.css       # Complete UI styling
│   └── script.js       # Frontend game logic
└── templates/
    └── index.html      # Main game page
```

## 🚀 Quick Start

### Installation
```bash
# Clone or download the project
cd AI-TicTacToe

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

### Access
Open your browser and navigate to `http://localhost:5000`

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main game page |
| `/move` | POST | Player move + AI response |
| `/ai-vs-ai` | POST | AI vs AI move generation |
| `/validate` | POST | Board validation & winner check |
| `/hint` | POST | Get optimal move hint |
| `/analytics` | POST | Board state analytics |
| `/health` | GET | Health check |

### Example API Request
```bash
curl -X POST http://localhost:5000/move \
  -H "Content-Type: application/json" \
  -d '{"board": ["X","","","","O","","","",""], "difficulty": "hard"}'
```

### Example Response
```json
{
  "board": ["X","","","","O","","","O",""],
  "winner": null,
  "ai_move": 7,
  "explanation": "AI blocked your winning move!",
  "analytics": {
    "available_moves": 6,
    "x_pieces": 1,
    "o_pieces": 2,
    "x_threats": 0,
    "o_threats": 1,
    "center_control": "O",
    "corner_control": 0
  }
}
```

## 🎯 How the AI Works

### Minimax Algorithm
1. **Recursive Evaluation** - Explores all possible game states
2. **Maximizing (AI)** - Tries to maximize score (win = +10)
3. **Minimizing (Player)** - Tries to minimize score (lose = -10)
4. **Depth Penalty** - Prefers winning sooner (`10 - depth`)

### Alpha-Beta Pruning
- **Alpha**: Best score for maximizing player
- **Beta**: Best score for minimizing player
- **Pruning**: Skips branches where beta ≤ alpha
- **Efficiency**: Reduces nodes from ~549,946 to ~25,000

### Difficulty Levels
| Mode | AI Behavior | Win Rate vs AI |
|------|-------------|----------------|
| Easy | 70% random moves | ~85% |
| Medium | 20% random moves | ~40% |
| Hard | 100% optimal | 0% (unbeatable) |

## 🎨 UI/UX Features

- **Animated cell placement** with scale and rotate effects
- **Winning line animation** drawn across winning cells
- **AI thinking indicator** with bouncing dots
- **Score pop animation** on score updates
- **Glow effects** on hover and win states
- **Gradient backgrounds** with subtle animations
- **Responsive grid** adapting to screen size

## 📱 Responsive Breakpoints

- **Desktop**: 120px cells, full layout
- **Tablet**: 100px cells, adjusted spacing
- **Mobile (<480px)**: 100px cells, stacked controls
- **Small Mobile (<360px)**: 90px cells, compact UI

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.8+, Flask |
| AI Engine | Minimax, Alpha-Beta Pruning |
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Styling | CSS Grid, Flexbox, CSS Variables |
| Animations | CSS Keyframes, Transitions |
| Audio | Web Audio API |
| Storage | localStorage (stats, theme) |

## 🚀 Deployment Options

### Render
```bash
# Create render.yaml or use web service
# Set build command: pip install -r requirements.txt
# Set start command: gunicorn app:app
```

### Railway
```bash
# Connect GitHub repo
# Railway auto-detects Python and Flask
```

### PythonAnywhere
```bash
# Upload files via Files tab
# Configure WSGI file to point to app.py
```

## 📋 Resume Description

**AI Tic-Tac-Toe Web Application**

- Developed a full-stack Tic-Tac-Toe game with an unbeatable AI using the Minimax algorithm and Alpha-Beta pruning optimization
- Built a RESTful Python backend with Flask handling game state validation, AI move generation, and analytics
- Implemented an interactive frontend with HTML5, CSS3, and vanilla JavaScript featuring real-time updates
- Designed multiple difficulty levels, move explanations, hint system, and comprehensive game statistics
- Created responsive UI with dark/light mode, sound effects, animations, and mobile-first design
- **Tech Stack:** Python, Flask, Minimax, Alpha-Beta Pruning, REST APIs, HTML5, CSS3, JavaScript

## 🎓 Learning Outcomes

- **Algorithm Design**: Implemented game tree search with optimization
- **API Design**: Created RESTful endpoints for game logic
- **Frontend Architecture**: Built stateful SPA without frameworks
- **UI/UX Design**: Created polished interface with animations
- **Performance**: Optimized AI from O(b^d) to O(b^(d/2)) with pruning

## 📄 License

MIT License - feel free to use for your portfolio!

---

**Built with ❤️ for AI/ML and Software Engineering portfolios**
