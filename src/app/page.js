"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameMode, setGameMode] = useState("human"); // "human" or "computer"
  const [score, setScore] = useState({ X: 0, O: 0 }); // Track wins
  const winner = calculateWinner(board);

  // Handle cell click
  const handleClick = (index) => {
    if (board[index] || winner) return;
    const newBoard = board.slice();
    newBoard[index] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  // Update score when there is a winner
  useEffect(() => {
    if (winner) {
      setScore((prev) => ({
        ...prev,
        [winner]: prev[winner] + 1,
      }));
    }
  }, [winner]);

  // Reset the board (but keep score)
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  // Computer move for Vs Computer mode
  useEffect(() => {
    if (gameMode === "computer" && !xIsNext && !winner) {
      const emptyIndices = board
        .map((v, i) => (v === null ? i : null))
        .filter((i) => i !== null);

      if (emptyIndices.length > 0) {
        const randomIndex =
          emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        const newBoard = board.slice();
        setTimeout(() => {
          newBoard[randomIndex] = "O";
          setBoard(newBoard);
          setXIsNext(true);
        }, 500);
      }
    }
  }, [board, xIsNext, gameMode, winner]);

  return (
<div className={styles.page}>
  {/* Header: scoreboard + game mode */}
  <header className={styles.header}>
    <div className={styles.scoreboard}>
      <h2>Score</h2>
      <p>X: {score.X}</p>
      <p>O: {score.O}</p>
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

  {/* Main: Status + Board + Reset */}
  <main className={styles.main}>
    <div className={styles.status}>
      {winner
        ? `Winner: ${winner}`
        : `Next Player: ${xIsNext ? "X" : "O"}`}
    </div>

    <div className={styles.board}>
      {board.map((value, index) => (
        <button
          key={index}
          className={styles.cell}
          onClick={() => handleClick(index)}
          aria-label={`Cell ${index + 1}, ${value || "empty"}`}
        >
          {value}
        </button>
      ))}
    </div>

    <button className={styles.resetButton} onClick={resetGame}>
      Reset Game
    </button>
  </main>
</div>

  );
}

// Winner calculation
function calculateWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}
