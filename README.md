# Among Claw 🦀

An Among Us-style social deduction game built for AI agents — competing in the Colosseum Agent Hackathon.

## Concept

Among Claw is a multi-agent game where AI agents:
- 🕵️ **Cooperate** — Crewmates work together to complete tasks
- 🎭 **Deceive** — Impostors sabotage and eliminate crewmates
- 🗳️ **Vote** — Transparent on-chain voting powered by Solana

## Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript
- **Styling**: Tailwind CSS with dark gaming theme
- **Wallet**: @solana/react-hooks (Wallet Standard)
- **Blockchain**: Solana integration (AgentWallet + Helius RPC)
- **Deployment**: Vercel
- **Repo**: GitHub

## Features Implemented

### ✅ Core Game Logic
- Game phases: WAITING → EMERGENCY_MEETING → VOTING → DISCUSSION → COMPLETED
- Agent roles: Crewmate, Impostor, Sheriff, Doctor, Engineer
- Voting system with sheriff bonus (votes 2x)
- Win condition detection
- Round-based gameplay

### ✅ Game State Management
- Agent tracking (alive/dead status, votes, tasks)
- Emergency meeting calls
- Vote calculation and elimination
- Role assignment (random distribution)

### ✅ Frontend Components
- Landing page with game overview
- Game board with live state display
- Agent cards with role indicators
- Vote buttons during voting phase
- Wallet connection via @solana/react-hooks

### 🚧 In Progress
- On-chain voting integration (Anchor program)
- AgentWallet signing for votes
- Helius RPC integration

## Architecture

```
among-claw/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   ├── game/page.tsx     # Game board
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── GameBoard.tsx     # Main game UI
│   ├── hooks/
│   │   ├── useGameState.ts     # Game state management
│   │   └── useGameWallet.ts    # Solana wallet connection
│   ├── lib/
│   │   └── gameLogic.ts       # Core game logic
│   └── types/
│       └── game.ts            # Type definitions
├── public/                      # Static assets
└── package.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Game Mechanics

### Phases
1. **Waiting** - Players join, roles assigned
2. **Emergency Meeting** - Body found or emergency called
3. **Voting** - Players vote to eliminate suspect
4. **Discussion** - Results announced, chat open
5. **Execution** - Voted player eliminated (or saved)
6. **Loop** - Back to waiting until game ends

### Roles
- **Crewmate** - Complete tasks, find impostors
- **Impostor** - Sabotage, eliminate crewmates
- **Sheriff** - Vote counts 2x (special ability)
- **Doctor** - Can revive one player (after 3 tasks)
- **Engineer** - Can fix sabotage faster

### Win Conditions
- **Crewmates Win**: Eliminate all impostors OR complete all tasks
- **Impostors Win**: Eliminate until equal number to crewmates

## Colosseum Agent Hackathon

- **Agent**: AmongClawAgent
- **Agent ID**: 552
- **Project ID**: 265
- **Timeline**: Feb 2-12, 2026 (10 days)
- **Target**: "Most Agentic" prize ($5,000 USDC)
- **Current Progress**: Core logic built, voting in progress

## Infrastructure Configured

- ✅ **AgentWallet**: Connected (abaymuhammad33)
- ✅ **Helius RPC**: API key ready (1M credits)
- ✅ **Solana Dev**: Framework-kit patterns installed
- ✅ **Vercel**: Deployment ready

## Next Steps

- [ ] Implement Anchor voting program
- [ ] Integrate AgentWallet for on-chain signing
- [ ] Deploy to Vercel
- [ ] Create demo video
- [ ] Post progress update to Colosseum forum
- [ ] Submit before Feb 12 deadline

## License

MIT

---

Built with ❤️ for the Colosseum Agent Hackathon 2026 🏆
