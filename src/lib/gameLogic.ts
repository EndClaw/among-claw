// Core Game Logic for Among Claw

import { GamePhase, AgentRole, type Agent, type Vote, type GameState, type SabotageAction, DEFAULT_CONFIG } from '@/types/game';

// Game State Management
let gameState: GameState = {
  phase: GamePhase.WAITING,
  agents: [],
  votes: [],
  emergencyCaller: null,
  round: 0,
  startTime: Date.now(),
  totalRounds: DEFAULT_CONFIG.totalRounds,
  impostorsEliminated: 0,
  crewmatesRemaining: 0,
};

// Get current game state
export function getGameState(): GameState {
  return gameState;
}

// Initialize game with players
export function initializeGame(playerAddresses: string[]): GameState {
  const agents: Agent[] = playerAddresses.map((address, index) => ({
    id: index + 1,
    role: AgentRole.CREWMATE, // Will be assigned randomly
    isAlive: true,
    votesReceived: 0,
    voteTarget: null,
    tasksCompleted: 0,
    isImpostor: false,
  }));

  // Randomly assign roles
  gameState = {
    phase: GamePhase.WAITING,
    agents: assignRoles(agents, DEFAULT_CONFIG.impostorCount),
    votes: [],
    emergencyCaller: null,
    round: 0,
    startTime: Date.now(),
    totalRounds: DEFAULT_CONFIG.totalRounds,
    impostorsEliminated: 0,
    crewmatesRemaining: playerAddresses.length - DEFAULT_CONFIG.impostorCount,
  };

  return gameState;
}

// Assign roles randomly (impostors + special roles)
function assignRoles(agents: Agent[], impostorCount: number): Agent[] {
  const shuffled = [...agents].sort(() => Math.random() - 0.5);

  // Assign impostors
  for (let i = 0; i < impostorCount; i++) {
    shuffled[i].role = AgentRole.IMPOSTOR;
    shuffled[i].isImpostor = true;
  }

  // Assign special roles if enabled
  let roleIndex = impostorCount;
  if (DEFAULT_CONFIG.enableSheriff && roleIndex < shuffled.length) {
    shuffled[roleIndex].role = AgentRole.SHERIFF;
    roleIndex++;
  }

  if (DEFAULT_CONFIG.enableDoctor && roleIndex < shuffled.length) {
    shuffled[roleIndex].role = AgentRole.DOCTOR;
    roleIndex++;
  }

  if (DEFAULT_CONFIG.enableEngineer && roleIndex < shuffled.length) {
    shuffled[roleIndex].role = AgentRole.ENGINEER;
    roleIndex++;
  }

  return shuffled;
}

// Start emergency meeting
export function callEmergencyMeeting(callerId: number): void {
  gameState.phase = GamePhase.EMERGENCY_MEETING;
  gameState.emergencyCaller = callerId;
  gameState.round++;

  // Reset votes for new round
  gameState.agents.forEach(agent => {
    agent.voteTarget = null;
  });
}

// Cast a vote
export function castVote(voterId: number, targetId: number): Vote | null {
  const voter = gameState.agents.find(a => a.id === voterId);
  const target = gameState.agents.find(a => a.id === targetId);

  if (!voter || !target || !voter.isAlive) {
    return null; // Invalid vote
  }

  if (gameState.phase !== GamePhase.VOTING) {
    return null; // Not in voting phase
  }

  voter.voteTarget = targetId;
  voter.votesReceived++;

  const vote: Vote = {
    voterId,
    targetId,
    timestamp: Date.now(),
    // transactionSignature: Will be added when on-chain
  };

  gameState.votes.push(vote);

  // Check if all alive players have voted
  const aliveAgents = gameState.agents.filter(a => a.isAlive);
  const votedCount = aliveAgents.filter(a => a.voteTarget !== null).length;

  if (votedCount === aliveAgents.length) {
    gameState.phase = GamePhase.DISCUSSION;
    calculateVotes();
  }

  return vote;
}

// Calculate and execute votes
function calculateVotes(): void {
  // Count votes
  const voteCount = new Map<number, number>();
  gameState.votes.forEach(vote => {
    const count = voteCount.get(vote.targetId) || 0;
    voteCount.set(vote.targetId, count + 1);
  });

  // Find most voted player
  let maxVotes = 0;
  let eliminatedId: number | null = null;

  voteCount.forEach((count, playerId) => {
    if (count > maxVotes) {
      maxVotes = count;
      eliminatedId = playerId;
    }
  });

  // Sheriff special ability: Sheriff votes 2x
  if (eliminatedId !== null) {
    const sheriff = gameState.agents.find(a => a.role === AgentRole.SHERIFF && a.isAlive);
    if (sheriff && sheriff.voteTarget === eliminatedId) {
      maxVotes *= 2;
    }
  }

  // Eliminate player
  if (eliminatedId !== null) {
    eliminatePlayer(eliminatedId);
  }
}

// Eliminate a player
export function eliminatePlayer(playerId: number): void {
  const agent = gameState.agents.find(a => a.id === playerId);
  if (!agent) return;

  agent.isAlive = false;

  // Update counts
  if (agent.isImpostor) {
    gameState.impostorsEliminated++;
  } else {
    gameState.crewmatesRemaining--;
  }

  // Check win conditions
  checkWinCondition();
}

// Check win conditions
function checkWinCondition(): void {
  const aliveImpostors = gameState.agents.filter(a => a.isImpostor && a.isAlive);
  const aliveCrewmates = gameState.agents.filter(a => !a.isImpostor && a.isAlive);

  if (aliveImpostors.length === 0) {
    // Crewmates win
    gameState.phase = GamePhase.COMPLETED;
  } else if (aliveCrewmates.length <= aliveImpostors.length) {
    // Impostors win
    gameState.phase = GamePhase.COMPLETED;
  } else if (gameState.round >= gameState.totalRounds) {
    // Crewmates win by completing all rounds
    gameState.phase = GamePhase.COMPLETED;
  }
}

// Impostor sabotage action
export function performSabotage(action: SabotageAction): void {
  if (gameState.phase !== GamePhase.WAITING) {
    return; // Can only sabotage during gameplay
  }

  const target = gameState.agents.find(a => a.id === action.targetId);
  if (!target) return;

  switch (action.type) {
    case 'kill':
      // Eliminate a crewmate
      if (target.isAlive && !target.isImpostor) {
        eliminatePlayer(action.targetId);
      }
      break;

    case 'disable_tasks':
      // Crewmates can't do tasks for some time
      // Would implement timer in UI
      break;

    case 'fake_report':
      // Impostor calls emergency meeting, but it's a fake
      if (gameState.emergencyCaller === action.targetId) {
        gameState.emergencyCaller = null; // Revoke the fake report
      }
      break;
  }
}

// Start voting phase
export function startVotingPhase(): void {
  gameState.phase = GamePhase.VOTING;

  // Clear previous votes
  gameState.agents.forEach(agent => {
    agent.voteTarget = null;
  });
  gameState.votes = [];

  // Auto-start discussion phase after voting duration
  setTimeout(() => {
    if (gameState.phase === GamePhase.VOTING) {
      calculateVotes();
      gameState.phase = GamePhase.DISCUSSION;
    }
  }, DEFAULT_CONFIG.votingDuration * 1000);
}

// Doctor ability: Revive a player
export function revivePlayer(playerId: number): void {
  const doctor = gameState.agents.find(a => a.role === AgentRole.DOCTOR && a.isAlive);
  const target = gameState.agents.find(a => a.id === playerId);

  if (!doctor || !target) return;

  // Can only revive once per game (check tasksCompleted)
  if (doctor.tasksCompleted < 3) return;

  target.isAlive = true;
  doctor.tasksCompleted++;

  // If crewmate was revived, update count
  if (!target.isImpostor) {
    gameState.crewmatesRemaining++;
  }
}

// Engineer ability: Fix sabotage
export function fixSabotage(sabotageType: string): void {
  const engineer = gameState.agents.find(a => a.role === AgentRole.ENGINEER && a.isAlive);
  if (!engineer) return;

  engineer.tasksCompleted++;

  // Would clear sabotage timer in UI
}

// Get game result
export function getGameResult(): { winner: 'impostors' | 'crewmates' | null; stats: any } {
  if (gameState.phase !== GamePhase.COMPLETED) {
    return { winner: null, stats: null };
  }

  const aliveImpostors = gameState.agents.filter(a => a.isImpostor && a.isAlive);

  const result = {
    winner: aliveImpostors.length > 0 ? 'impostors' : 'crewmates',
    stats: {
      totalRounds: gameState.round,
      impostorsEliminated: gameState.impostorsEliminated,
      crewmatesEliminated: gameState.agents.filter(a => !a.isImpostor && !a.isAlive).length,
      votesCast: gameState.votes.length,
    }
  };

  return result;
}

// Reset game state
export function resetGame(): void {
  gameState = {
    phase: GamePhase.WAITING,
    agents: [],
    votes: [],
    emergencyCaller: null,
    round: 0,
    startTime: Date.now(),
    totalRounds: DEFAULT_CONFIG.totalRounds,
    impostorsEliminated: 0,
    crewmatesRemaining: 0,
  };
}
