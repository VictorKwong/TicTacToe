"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";

// 🎉 Confetti function
function triggerConfetti() {
  const colors = ["#4CAF50", "#FFC107", "#03A9F4", "#E91E63", "#9C27B0"];
  const bodyHeight = window.innerHeight; // viewport height
  const bodyWidth = window.innerWidth;   // viewport width

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.className = styles.confetti;

    // Random color
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    // Random horizontal position within viewport
    confetti.style.left = `${Math.random() * (bodyWidth - 10)}px`; // -10px so it doesn't overflow

    // Start slightly above viewport
    confetti.style.top = `-10px`;

    // Random size
    const size = 5 + Math.random() * 8;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;

    // Random animation speed
    const duration = 3 + Math.random() * 2;
    confetti.style.animationDuration = `${duration}s`;

    // Random animation delay
    const delay = Math.random() * 2;
    confetti.style.animationDelay = `${delay}s`;

    document.body.appendChild(confetti);

    // Remove after animation finishes
    setTimeout(() => confetti.remove(), (duration + delay) * 1000);
  }
}

// Winner line component
function WinnerLine({ line, lineType, lineIndex }) {
  if (!line || line.length !== 3) return null;
  const style = getWinnerLineStyle(line, lineType, lineIndex);
  return <div className={styles.winnerLine} style={style}></div>;
}

export default function Home() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameMode, setGameMode] = useState("human");
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const celebrationTimer = useRef(null);

  const { winner, line: winningLine, lineType, lineIndex } = calculateWinner(board);

  // Handle click
  const handleClick = (index) => {
    if (board[index] || winner || (gameMode === "computer" && isComputerThinking)) return;
    const newBoard = [...board];
    newBoard[index] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  // Score & celebration
useEffect(() => {
  if (gameMode === "computer" && !xIsNext && !winner) {
    setIsComputerThinking(true);
    const empty = board.map((v, i) => (v ? null : i)).filter((i) => i !== null);

    if (empty.length > 0) {
      const randomIndex = empty[Math.floor(Math.random() * empty.length)];
      setTimeout(() => {
        const newBoard = [...board];
        newBoard[randomIndex] = "O";
        setBoard(newBoard);
        setXIsNext(true);
        setIsComputerThinking(false);
      }, 700);
    } else {
      // Board full, tie
      setIsComputerThinking(false); // <-- good
    }
  }
}, [board, xIsNext, gameMode, winner]);


useEffect(() => {
  // Stop computer thinking if game ends
  if (winner || board.every(cell => cell !== null)) {
    setIsComputerThinking(false);
  }
}, [winner, board]);

  // Reset board
  const resetGame = () => {
    if (celebrationTimer.current) {
      clearTimeout(celebrationTimer.current);
      celebrationTimer.current = null;
    }
    setCelebrating(false);
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setIsComputerThinking(false);
  };


  return (
    <div className={`${styles.page} ${celebrating ? styles.celebration : ""}`} role="main">
      {/* Header: Scoreboard + Game Mode */}
      <header className={styles.header}>
        <div className={styles.scoreboard} aria-label="Game score">
          <h2>Scoreboard</h2>
          <div className={styles.scoreContainer}>
            <div className={`${styles.scoreBox} ${styles.scoreX}`}>
              <span className={styles.scoreLabel}>X: </span>
              <span className={styles.scoreValue}>{score.X}</span>
            </div>
            <div className={`${styles.scoreBox} ${styles.scoreO}`}>
              <span className={styles.scoreLabel}>O: </span>
              <span className={styles.scoreValue}>{score.O}</span>
            </div>
          </div>
        </div>

        <div className={styles.gameMode}>
          <label>
            <input
              type="radio"
              name="mode"
              value="human"
              checked={gameMode === "human"}
              onChange={(e) => resetGame() || setGameMode(e.target.value)}
            />
            Vs Human
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              value="computer"
              checked={gameMode === "computer"}
              onChange={(e) => resetGame() || setGameMode(e.target.value)}
            />
            Vs Computer
          </label>
        </div>
      </header>

      {/* Main Game Area */}
      <main className={styles.main}>
        <div className={styles.status} aria-live="polite">
          {winner
            ? `Winner: ${winner}`
            : board.every((cell) => cell !== null)
            ? "It's a tie!"
            : isComputerThinking
            ? "Computer is thinking..."
            : `Next Player: ${xIsNext ? "X" : "O"}`}
        </div>

        <div className={styles.board}>
          {board.map((value, i) => (
            <button
              key={i}
              className={styles.cell}
              onClick={() => handleClick(i)}
              aria-label={`Cell ${i + 1}, ${value || "empty"}`}
              disabled={!!winner || (gameMode === "computer" && isComputerThinking)}
            >
              {value}
            </button>
          ))}

          {/* Winner line */}
          {winner && <WinnerLine line={winningLine} lineType={lineType} lineIndex={lineIndex} />}
        </div>

        <button
          className={styles.resetButton}
          onClick={resetGame}
          disabled={isComputerThinking} // <-- disable when computer is thinking
        >
          Reset Game
        </button>
      </main>
    </div>
  );
}

// Winner logic
function calculateWinner(board) {
  const lines = [
    { cells: [0, 1, 2], type: "row", index: 0 },
    { cells: [3, 4, 5], type: "row", index: 1 },
    { cells: [6, 7, 8], type: "row", index: 2 },
    { cells: [0, 3, 6], type: "col", index: 0 },
    { cells: [1, 4, 7], type: "col", index: 1 },
    { cells: [2, 5, 8], type: "col", index: 2 },
    { cells: [0, 4, 8], type: "diag", index: 0 },
    { cells: [2, 4, 6], type: "diag", index: 1 },
  ];

  for (let { cells, type, index } of lines) {
    const [a, b, c] = cells;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: cells, lineType: type, lineIndex: index };
    }
  }
  return { winner: null, line: [], lineType: null, lineIndex: null };
}

// Winner line style
function getWinnerLineStyle(line, lineType, lineIndex) {
  const cellSize = 80;
  const gap = 5;
  const boardSize = cellSize * 3 + gap * 2;
  const extra = 5; // extend slightly beyond edges

  switch (lineType) {
    case "row":
      return {
        width: `${boardSize + extra * 2}px`,
        height: "4px",
        top: `${lineIndex * (cellSize + gap) + cellSize / 2 - 2}px`,
        left: `-${extra}px`,
        transform: "scaleX(1)",
        transformOrigin: "left center",
      };

    case "col":
      return {
        width: "4px",
        height: `${boardSize + extra * 2}px`,
        top: `-${extra}px`,
        left: `${lineIndex * (cellSize + gap) + cellSize / 2 - 2}px`,
        transform: "scaleY(1)",
        transformOrigin: "center top",
      };

    case "diag":
      const diagonalLength = Math.sqrt((boardSize + extra * 2) ** 2 + (boardSize + extra * 2) ** 2);
      if (lineIndex === 0) {
        return {
          width: `${diagonalLength}px`,
          height: "4px",
          top: `-${extra}px`,
          left: `-${extra}px`,
          transform: "rotate(45deg) scaleX(1)",
          transformOrigin: "0 0",
        };
      } else {
        return {
          width: `${diagonalLength}px`,
          height: "4px",
          top: "0",
          right: "0",
          transform: `rotate(-45deg) scaleX(1)`,
          transformOrigin: "top right",
        };
      }

    default:
      return {};
  }
}
