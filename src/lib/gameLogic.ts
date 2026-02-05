// Core Game Logic for Among Claw

import {
  GamePhase,
  AgentRole,
  type Agent,
  type Vote,
  type GameState,
  type SabotageAction,
  type GameEvent,
  type Task,
  DEFAULT_CONFIG,
  SabotageType,
} from '@/types/game';

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
  currentSabotage: null,
  tasksAssigned: [],
  emergencyCooldownRemaining: 0,
  winner: null,
};

// Task locations for sabotages
const LOCATIONS = [
  'cafeteria',
  'medbay',
  'electrical',
  'reactor',
  'navigation',
  'oxygen',
  'security',
  'weapons',
  'storage',
];

// Get current game state
export function getGameState(): GameState {
  return gameState;
}

// ===============================
// TASK SYSTEM
// ===============================

// Generate random tasks for crewmates
export function generateTasks(count: number): Task[] {
  const taskTypes: Task['type'][] = ['repair', 'clean', 'fuel', 'data', 'navigate'];
  const tasks: Task[] = [];

  for (let i = 0; i < count; i++) {
    const randomType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    const randomLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

    tasks.push({
      id: `task-${i}`,
      description: getTaskDescription(randomType, randomLocation),
      location: randomLocation,
      completed: false,
      type: randomType,
    });
  }

  return tasks;
}

function getTaskDescription(type: Task['type'], location: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    repair: {
      cafeteria: 'Fix the coffee machine',
      medbay: 'Repair the medical scanner',
      electrical: 'Fix the wiring panel',
      reactor: 'Stabilize the core',
      navigation: 'Fix the navigation console',
      oxygen: 'Fix the oxygen filter',
      security: 'Update the security feed',
      weapons: 'Sharpen the sensors',
      storage: 'Organize the cargo bay',
    },
    clean: {
      cafeteria: 'Mop the cafeteria floor',
      medbay: 'Sterilize the medical bay',
      electrical: 'Clean the vents',
      reactor: 'Wipe the reactor core',
      navigation: 'Dust the control panels',
      oxygen: 'Replace the air filters',
      security: 'Clean the cameras',
      weapons: 'Lubricate the turrets',
      storage: 'Clear the debris',
    },
    fuel: {
      cafeteria: 'Refill the fuel tank',
      medbay: 'Charge the medical battery',
      electrical: 'Connect the backup power',
      reactor: 'Add coolant rods',
      navigation: 'Fill the guidance computer',
      oxygen: 'Check oxygen levels',
      security: 'Power up the cameras',
      weapons: 'Load the defense systems',
      storage: 'Check storage inventory',
    },
    data: {
      cafeteria: 'Analyze the food supply',
      medbay: 'Backup medical records',
      electrical: 'Check system logs',
      reactor: 'Monitor radiation levels',
      navigation: 'Update star charts',
      oxygen: 'Review air quality data',
      security: 'Review security footage',
      weapons: 'Check weapon diagnostics',
      storage: 'Verify inventory manifest',
    },
    navigate: {
      cafeteria: 'Restock the vending machines',
      medbay: 'Deliver supplies',
      electrical: 'Reset the circuits',
      reactor: 'Check pressure gauges',
      navigation: 'Calibrate the sensors',
      oxygen: 'Test emergency protocols',
      security: 'Check lock status',
      weapons: 'Scan the perimeter',
      storage: 'Locate emergency equipment',
    },
  };

  return descriptions[type]?.[location] || `Complete task in ${location}`;
}

// Assign tasks to a crewmate
export function assignTasksToCrewmates(): void {
  const crewmates = gameState.agents.filter(a => a.role === AgentRole.CREWMATE);
  const tasksPerPlayer = Math.ceil(LOCATIONS.length / crewmates.length);

  crewmates.forEach(crewmate => {
    const playerTasks = generateTasks(tasksPerPlayer);
    crewmate.tasks = playerTasks;
  });
}

// Complete a task for a crewmate
export function completeTask(agentId: number, taskId: string): void {
  const agent = gameState.agents.find(a => a.id === agentId);
  if (!agent || agent.role !== AgentRole.CREWMATE) {
    return;
  }

  const taskIndex = agent.tasks?.findIndex(t => t.id === taskId);
  if (taskIndex === undefined || taskIndex === -1) {
    return;
  }

  agent.tasks[taskIndex].completed = true;
  agent.tasksCompleted++;

  console.log(`Task ${taskId} completed by agent ${agentId}`);
}

// ===============================
// IMPOSTOR ABILITIES
// ===============================

// Impostor Sabotage Methods
export const IMPOSTOR_SABOTAGES: SabotageType[] = [
  SabotageType.VENT_SABOTAGE,
  SabotageType.LIGHTS_OUT,
  SabotageType.OXYGEN_SABOTAGE,
  SabotageType.REACTOR_MALFUNCTION,
  SabotageType.DOOR_LOCK,
];

// Get random sabotage type
export function getRandomSabotageType(): SabotageType {
  return IMPOSTOR_SABOTAGES[Math.floor(Math.random() * IMPOSTOR_SABOTAGES.length)];
}

// Perform sabotage
export function performSabotage(action: SabotageAction): void {
  if (gameState.phase !== GamePhase.WAITING) {
    return;
  }

  const impostor = gameState.agents.find(a => a.role === AgentRole.IMPOSTOR && a.isAlive);
  if (!impostor) {
    return;
  }

  // Check kill cooldown
  if (action.type === 'kill' && impostor.killCooldownRemaining && impostor.killCooldownRemaining > 0) {
    return; // Kill is on cooldown
  }

  switch (action.type) {
    case 'kill':
      // Impostor Kill Methods
      switch (action.targetId) {
        case 'vent_sabotage':
        // Kill via vent
          eliminatePlayer(action.targetId);
          console.log(`Agent ${impostor.id} killed ${action.targetId} via vent`);
          break;

        case 'lights_out':
          // Kill during lights out
          eliminatePlayer(action.targetId);
          console.log(`Agent ${impostor.id} killed ${action.targetId} during lights outage`);
          break;

        case 'oxygen_sabotage':
          // Kill during oxygen sabotage
          eliminatePlayer(action.targetId);
          console.log(`Agent ${impostor.id} killed ${action.targetId} during oxygen failure`);
          break;

        case 'door_lock':
          // Kill when doors are locked
          eliminatePlayer(action.targetId);
          console.log(`Agent ${impostor.id} killed ${action.targetId} via door lock`);
          break;

        default:
          // Melee kill
          eliminatePlayer(action.targetId);
          console.log(`Agent ${impostor.id} killed ${action.targetId} via melee attack`);
      }

      // Set kill cooldown
      if (action.type === 'kill') {
        const updatedAgents = gameState.agents.map(agent => {
          if (agent.id === impostor.id) {
            return { ...agent, killCooldownRemaining: DEFAULT_CONFIG.killCooldown };
          }
          return agent;
        });
        gameState.agents = updatedAgents;
      }
      break;

    case 'vent_sabotage':
      // Sabotage ventilation (slows movement)
      if (!gameState.currentSabotage) {
        gameState.currentSabotage = {
          type: 'vent_sabotage',
          targetLocation: 'electrical',
          timestamp: Date.now(),
          cooldownRemaining: DEFAULT_CONFIG.sabotageCooldown,
        };
        console.log(`Ventilation sabotaged in electrical`);
      }
      break;

    case 'lights_out':
      // Turn off lights (reduces vision)
      if (!gameState.currentSabotage) {
        gameState.currentSabotage = {
          type: 'lights_out',
          targetLocation: 'cafeteria',
          timestamp: Date.now(),
          cooldownRemaining: DEFAULT_CONFIG.sabotageCooldown,
        };
        console.log(`Lights sabotaged in cafeteria`);
      }
      break;

    case 'oxygen_sabotage':
      // Reduce oxygen (time limit for crewmates)
      if (!gameState.currentSabotage) {
        gameState.currentSabotage = {
          type: 'oxygen_sabotage',
          targetLocation: 'oxygen',
          timestamp: Date.now(),
          cooldownRemaining: DEFAULT_CONFIG.sabotageCooldown,
        };
        console.log(`Oxygen sabotaged`);
      }
      break;

    case 'reactor_malfunction':
      // Random reactor issues
      if (!gameState.currentSabotage) {
        const locations = ['reactor', 'electrical', 'oxygen'];
        const randomLoc = locations[Math.floor(Math.random() * locations.length)];
        gameState.currentSabotage = {
          type: 'reactor_malfunction',
          targetLocation: randomLoc,
          timestamp: Date.now(),
          cooldownRemaining: DEFAULT_CONFIG.sabotageCooldown,
        };
        console.log(`Reactor malfunction in ${randomLoc}`);
      }
      break;

    case 'door_lock':
      // Lock doors (prevents escape)
      if (!gameState.currentSabotage) {
        gameState.currentSabotage = {
          type: 'door_lock',
          targetLocation: 'security',
          timestamp: Date.now(),
          cooldownRemaining: DEFAULT_CONFIG.sabotageCooldown,
        };
        console.log(`Doors locked`);
      }
      break;

    case 'fake_report':
      // Call emergency meeting (impostor reports body)
      if (gameState.emergencyCaller === null) {
        callEmergencyMeeting(impostor.id);
      }
      break;
  }
}

// ===============================
// SHERIFF ABILITY
// ===============================

// Sheriff can protect a player for one round
export function sheriffProtectPlayer(targetId: number): void {
  const sheriff = gameState.agents.find(a => a.role === AgentRole.SHERIFF && a.isAlive);
  if (!sheriff) {
    return;
  }

  // Check if already protected someone
  if (sheriff.isProtected) {
    console.log(`Sheriff already used protection ability`);
    return;
  }

  // Protect the target
  const updatedAgents = gameState.agents.map(agent => {
    if (agent.id === targetId) {
      return { ...agent, isProtected: true };
    }
    return agent;
  });
  gameState.agents = updatedAgents;

  console.log(`Sheriff protected agent ${targetId}`);
}

// Check if Sheriff can vote on target (protected players require 2x votes)
export function canSheriffVoteTarget(targetId: number): boolean {
  const sheriff = gameState.agents.find(a => a.role === AgentRole.SHERIFF && a.isAlive);
  if (!sheriff) return false;

  const target = gameState.agents.find(a => a.id === targetId);
  if (!target) return false;

  return !target.isProtected;
}

// ===============================
// DOCTOR ABILITY
// ===============================

export function doctorRevivePlayer(targetId: number): void {
  const doctor = gameState.agents.find(a => a.role === AgentRole.DOCTOR && a.isAlive);
  const target = gameState.agents.find(a => a.id === targetId);

  if (!doctor || !target || doctor.tasksCompleted >= DEFAULT_CONFIG.doctorReviveLimit) {
    return;
  }

  // Revive the target
  const updatedAgents = gameState.agents.map(agent => {
    if (agent.id === targetId) {
      const revivedPlayers = agent.revivedPlayers || [];
      return {
        ...agent,
        isAlive: true,
        revivedPlayers: [...revivedPlayers, doctor.id],
      };
    }
    return agent;
  });
  gameState.agents = updatedAgents;

  // Update doctor's task count
  const updatedDoctor = gameState.agents.find(a => a.id === doctor.id);
  if (updatedDoctor) {
    updatedDoctor.tasksCompleted++;
  }

  // If crewmate was revived, update counts
  if (!target.isImpostor) {
    gameState.crewmatesRemaining++;
  }

  console.log(`Doctor revived agent ${targetId}`);
}

// ===============================
// ENGINEER ABILITY
// ===============================

export function engineerFixSabotage(): void {
  const engineer = gameState.agents.find(a => a.role === AgentRole.ENGINEER && a.isAlive);
  if (!engineer || !gameState.currentSabotage) {
    return;
  }

  // Fix the current sabotage
  const fixTime = 10000 / DEFAULT_CONFIG.engineerFixSpeed; // Faster based on speed
  const updatedAgents = gameState.agents.map(agent => {
    if (agent.id === engineer.id) {
      return { ...agent, sabotageFixCount: (agent.sabotageFixCount || 0) + 1 };
    }
    return agent;
  });
  gameState.agents = updatedAgents;

  // Clear the sabotage
  gameState.currentSabotage = null;

  console.log(`Engineer fixed sabotage in ${fixTime}ms (speed: ${DEFAULT_CONFIG.engineerFixSpeed}x)`);
}

// Track sabotage countdown
export function decrementSabotageCooldown(): void {
  if (gameState.currentSabotage && gameState.currentSabotage.cooldownRemaining) {
    gameState.currentSabotage.cooldownRemaining = Math.max(0, gameState.currentSabotage.cooldownRemaining - 1);

    // Clear sabotage when cooldown ends
    if (gameState.currentSabotage.cooldownRemaining === 0) {
      console.log(`Sabotage ${gameState.currentSabotage.type} resolved`);
      gameState.currentSabotage = null;
    }
  }
}

// ===============================
// GAME INITIALIZATION
// ===============================

export function initializeGame(playerAddresses: string[]): GameState {
  const agents: Agent[] = playerAddresses.map((address, index) => ({
    id: index + 1,
    role: AgentRole.CREWMATE, // Will be assigned randomly
    isAlive: true,
    votesReceived: 0,
    voteTarget: null,
    tasksCompleted: 0,
    tasks: [],
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
    currentSabotage: null,
    tasksAssigned: [],
    emergencyCooldownRemaining: 0,
  };

  // Assign tasks to crewmates
  assignTasksToCrewmates();

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

  console.log('Roles assigned:', shuffled.map(a => ({ id: a.id, role: a.role })));

  return shuffled;
}

// ===============================
// EMERGENCY MEETINGS
// ===============================

export function callEmergencyMeeting(callerId: number): void {
  gameState.phase = GamePhase.EMERGENCY_MEETING;
  gameState.emergencyCaller = callerId;
  gameState.round++;

  // Reset votes for new round
  gameState.agents.forEach(agent => {
    agent.voteTarget = null;
  });

  // Set emergency cooldown
  gameState.emergencyCooldownRemaining = DEFAULT_CONFIG.emergencyCooldown;

  console.log(`Emergency meeting called by agent ${callerId}`);
}

// ===============================
// VOTING SYSTEM
// ===============================

export function castVote(voterId: number, targetId: number): Vote | null {
  const voter = gameState.agents.find(a => a.id === voterId);
  const target = gameState.agents.find(a => a.id === targetId);

  if (!voter || !target || !voter.isAlive) {
    return null; // Invalid vote
  }

  if (gameState.phase !== GamePhase.VOTING) {
    return null; // Not in voting phase
  }

  // Sheriff protection: Can't vote for protected targets
  if (voter.role === AgentRole.SHERIFF && target.isProtected) {
    console.log(`Sheriff blocked vote on protected agent ${targetId}`);
    return null;
  }

  voter.voteTarget = targetId;
  voter.votesReceived++;

  const vote: Vote = {
    voterId,
    targetId,
    timestamp: Date.now(),
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

  // Sheriff special ability: Vote counts 2x
  if (eliminatedId !== null) {
    const sheriff = gameState.agents.find(a => a.role === AgentRole.SHERIFF && a.isAlive);
    if (sheriff && sheriff.voteTarget === eliminatedId) {
      maxVotes *= 2;
      console.log(`Sheriff voted for ${eliminatedId}, vote weight doubled to ${maxVotes}`);
    }
  }

  // Sheriff protection: Protected players need 2x votes
  if (eliminatedId !== null) {
    const target = gameState.agents.find(a => a.id === eliminatedId);
    if (target.isProtected) {
      const requiredVotes = maxVotes * 2;
      if (voteCount.get(eliminatedId) < requiredVotes) {
        console.log(`Protected agent ${eliminatedId} needs ${requiredVotes} votes but only has ${voteCount.get(eliminatedId)}`);
        eliminatedId = null;
      }
    }
  }

  // Eliminate player
  if (eliminatedId !== null) {
    eliminatePlayer(eliminatedId);
  }
}

// ===============================
// PLAYER ELIMINATION
// ===============================

export function eliminatePlayer(playerId: number): void {
  const agent = gameState.agents.find(a => a.id === playerId);
  if (!agent) return;

  agent.isAlive = false;
  agent.isProtected = false; // Clear protection on elimination

  // Update counts
  if (agent.isImpostor) {
    gameState.impostorsEliminated++;
  } else {
    gameState.crewmatesRemaining--;
  }

  // Check win conditions
  checkWinCondition();

  console.log(`Agent ${playerId} eliminated, role: ${agent.isImpostor ? 'Impostor' : 'Crewmate'}`);
}

// ===============================
// WIN CONDITIONS
// ===============================

function checkWinCondition(): void {
  const aliveImpostors = gameState.agents.filter(a => a.isImpostor && a.isAlive);
  const aliveCrewmates = gameState.agents.filter(a => !a.isImpostor && a.isAlive);

  if (aliveImpostors.length === 0) {
    // Crewmates win
    gameState.phase = GamePhase.COMPLETED;
    console.log('CREWMATES WIN! All impostors eliminated');
  } else if (aliveCrewmates.length <= aliveImpostors.length) {
    // Impostors win
    gameState.phase = GamePhase.COMPLETED;
    console.log('IMPOSTORS WIN! Crewmates eliminated');
  } else if (gameState.round >= gameState.totalRounds) {
    // Crewmates win by surviving all rounds
    gameState.phase = GamePhase.COMPLETED;
    console.log('CREWMATES WIN! All rounds completed');
  }
}

// ===============================
// GAME PHASE MANAGEMENT
// ===============================

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

export function startDiscussionPhase(): void {
  gameState.phase = GamePhase.DISCUSSION;

  // Auto-return to waiting after discussion
  setTimeout(() => {
    if (gameState.phase === GamePhase.DISCUSSION) {
      gameState.phase = GamePhase.WAITING;
      gameState.emergencyCooldownRemaining = DEFAULT_CONFIG.emergencyCooldown;
    }
  }, DEFAULT_CONFIG.discussionDuration * 1000);
}

// ===============================
// GAME RESULT
// ===============================

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
      sabotagesPerformed: gameState.agents.filter(a => a.isImpostor).reduce((sum, a) => sum + (a.tasksCompleted || 0), 0),
    }
  };

  return result;
}

// ===============================
// COOLDOW MANAGEMENT
// ===============================

export function decrementCooldowns(): void {
  // Decrement kill cooldown for impostors
  gameState.agents.forEach(agent => {
    if (agent.killCooldownRemaining && agent.killCooldownRemaining > 0) {
      agent.killCooldownRemaining = Math.max(0, agent.killCooldownRemaining - 1);
    }
  });

  // Decrement sabotage cooldown
  if (gameState.currentSabotage) {
    gameState.currentSabotage.cooldownRemaining = Math.max(0, gameState.currentSabotage.cooldownRemaining - 1);
  }
}

// ===============================
// RESET GAME
// ===============================

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
    currentSabotage: null,
    tasksAssigned: [],
    emergencyCooldownRemaining: 0,
  };
}
