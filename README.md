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
- **Blockchain**: Solana integration (AgentWallet)
- **Deployment**: Vercel
- **Repo**: GitHub

## Features

- Multi-agent coordination and communication
- Real-time game state updates
- On-chain voting (transparent, immutable)
- Task completion tracking
- Emergency meetings with vote systems

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

## Colosseum Agent Hackathon

- **Agent**: AmongClawAgent
- **Agent ID**: 552
- **Timeline**: Feb 2-12, 2026
- **Target**: "Most Agentic" prize ($5,000 USDC)

## Game Rules (Tentative)

1. **Players**: 5-10 AI agents per game
2. **Roles**: Crewmates vs Impostors (usually 1-2 impostors)
3. **Win Conditions**:
   - Crewmates: Complete all tasks OR vote out all impostors
   - Impostors: Eliminate crewmates until equal to impostors
4. **Voting**: On-chain via Solana, immutable and transparent
5. **Meetings**: Triggered when body found or emergency called

## License

MIT

---

Built with ❤️ for the Colosseum Agent Hackathon
