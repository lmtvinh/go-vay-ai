# Go Vay AI

Go Vay AI is a web platform for learning, playing, and reviewing Go games with AI-powered explanations.

The goal of this project is to help beginners learn Go/Baduk/Weiqi step by step, play games, review mistakes, and improve through AI-assisted explanations.

## Current Status

This project is currently in early development.

Completed:

- [x] Basic 9x9 Go board
- [x] Stone placement
- [x] Turn switching
- [x] Liberty detection
- [x] Capture logic
- [x] Prevent occupied-point moves
- [x] Prevent suicide moves
- [x] Captured stone counter
- [x] Move history
- [x] Centered error popup for invalid moves

In progress:

- [ ] Pass button
- [ ] Resign button
- [ ] Game finished state
- [ ] Ko rule
- [ ] Game replay
- [ ] Save game records

## Planned Features

### Learning Mode

- Beginner Go lessons
- Liberty and capture tutorials
- Atari exercises
- Life and death puzzles
- Opening, middle game, and endgame lessons

### Play Modes

- Human vs Human
- Human vs Bot
- Human vs AI Coach
- Local play
- Online play

### Game Review

- Replay completed games
- Detect important mistakes
- Suggest better moves
- Explain mistakes in Vietnamese
- Generate post-game reports
- Recommend lessons based on player mistakes

### AI Features

- KataGo engine integration
- AI move suggestions
- Win rate and score analysis
- AI Coach explanations in Vietnamese

## Tech Stack

### Current

- Next.js
- TypeScript
- Tailwind CSS
- React

### Planned

- Firebase Authentication
- PostgreSQL / Supabase
- Prisma
- KataGo Engine
- AI Explanation Service

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the app:

```txt
http://localhost:3000
```

Open the play page:

```txt
http://localhost:3000/play
```

## Project Structure

```txt
app/
  page.tsx
  play/
    page.tsx

components/
  goban/
    GoBoard.tsx
  ui/
    ErrorPopup.tsx

lib/
  go/
    board.ts
    types.ts

public/
```

## Git Workflow

Create a new branch for each feature:

```bash
git checkout -b feature/feature-name
```

Example:

```bash
git checkout -b feature/game-controls
```

Commit changes:

```bash
git add .
git commit -m "feat: add game controls"
```

Push the branch:

```bash
git push -u origin feature/game-controls
```

Then create a Pull Request on GitHub:

```txt
feature/game-controls -> main
```

## Commit Message Convention

This project uses simple conventional commit messages:

```txt
feat: add a new feature
fix: fix a bug
docs: update documentation
style: update UI or formatting
refactor: improve code without changing behavior
chore: setup or maintenance work
test: add or update tests
```

Examples:

```bash
git commit -m "feat: add pass and resign buttons"
git commit -m "fix: prevent moves after game finished"
git commit -m "docs: update project roadmap"
```

## Roadmap

### MVP 1: Basic Go Board

- [x] Render 9x9 board
- [x] Place black and white stones
- [x] Switch turns
- [x] Prevent placing stones on occupied points
- [x] Reset game

### MVP 2: Go Rules

- [x] Detect liberties
- [x] Capture stones
- [x] Prevent suicide moves
- [ ] Add Ko rule
- [ ] Add Pass
- [ ] Add Resign
- [ ] Add basic scoring

### MVP 3: Game Review

- [ ] Save move history
- [ ] Replay game
- [ ] Review each move
- [ ] Detect basic mistakes

### MVP 4: Authentication and Save Games

- [ ] Google login
- [ ] Facebook login
- [ ] Save game records
- [ ] Show game history

### MVP 5: AI Review

- [ ] Integrate KataGo
- [ ] Analyze completed games
- [ ] Suggest better moves
- [ ] Explain mistakes in Vietnamese

## License

MIT