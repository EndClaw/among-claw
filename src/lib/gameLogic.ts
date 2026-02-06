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
  SabotageType,
  Winner,
  DEFAULT_CONFIG,
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
      cafeteria: 'Fix coffee machine',
      medbay: 'Repair medical scanner',
      electrical: 'Fix wiring panel',
      reactor: 'Stabilize core',
      navigation: 'Fix navigation console',
      oxygen: 'Fix oxygen filter',
      security: 'Update security feed',
      weapons: 'Sharpen sensors',
      storage: 'Organize cargo bay',
    },
    clean: {
      cafeteria: 'Mop cafeteria floor',
      medbay: 'Sterilize medical bay',
      electrical: 'Clean vents',
      reactor: 'Wipe reactor core',
      navigation: 'Dust control panels',
      oxygen: 'Replace air filters',
      security: 'Clean cameras',
      weapons: 'Lubricate turrets',
      storage: 'Clear debris',
    },
    fuel: {
      cafeteria: 'Refill fuel tank',
      medbay: 'Charge medical battery',
      electrical: 'Connect backup power',
      reactor: 'Add coolant rods',
      navigation: 'Fill guidance computer',
      oxygen: 'Check oxygen levels',
      security: 'Power up cameras',
      weapons: 'Load defense systems',
      storage: 'Check storage inventory',
    },
    data: {
      cafeteria: 'Analyze food supply',
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
      cafeteria: 'Restock vending machines',
      medbay: 'Deliver supplies',
      electrical: 'Check system logs',
      reactor: 'Monitor radiation levels',
      navigation: 'Fill guidance computer',
      oxygen: 'Check oxygen levels',
      security: 'Power up cameras',
      weapons: 'Load defense systems',
      storage: 'Check storage inventory',
    },
  };

  return descriptions[type]?.[location] || `Complete task in ${location}`;
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

  const targetId = typeof action.targetId === 'number' ? action.targetId : parseInt(action.targetId as string);

  switch (action.type) {
    case SabotageType.KILL:
      // Impostor Kill Methods
      switch (action.targetId) {
        case SabotageType.VENT_SABOTAGE:
          // Kill via vent
          eliminatePlayer(targetId);
          console.log(`Agent ${impostor.id} killed ${targetId} via vent`);
          break;

        case SabotageType.LIGHTS_OUT:
          // Kill during lights out
          eliminatePlayer(targetId);
          console.log(`Agent ${impostor.id} killed ${targetId} during lights outage`);
          break;

        case SabotageType.OXYGEN_SABOTAGE:
          // Kill during oxygen sabotage
          eliminatePlayer(targetId);
          console.log(`Agent ${impostor.id} killed ${targetId} during oxygen failure`);
          break;

        case SabotageType.DOOR_LOCK:
          // Kill when doors are locked
          eliminatePlayer(targetId);
          console.log(`Agent ${impostor.id} killed ${targetId} via door lock`);
          break;

        default:
          // Melee kill
          eliminatePlayer(targetId);
          console.log(`Agent ${impostor.id} killed ${targetId} via melee attack`);
      }

      // Set kill cooldown
      if (action.type === SabotageType.KILL) {
        const updatedAgents = gameState.agents.map(agent => {
          if (agent.id === impostor.id) {
            return { ...agent, killCooldownRemaining: DEFAULT_CONFIG.killCooldown };
          }
          return agent;
        });
        gameState.agents = updatedAgents;
      }
      break;

    case SabotageType.VENT_SABOTAGE:
      // Sabotage ventilation (slows movement)
      if (!gameState.currentSabotage) {
        gameState.currentSabotage = {
          type: SabotageType.VENT_SABOTAGE,
          targetLocation: 'electrical',
          timestamp: Date.now(),
          cooldownRemaining: DEFAULT_CONFIG.sabotageCooldown,
        };
        console.log('Ventilation sabotaged in electrical');
      }
      break;

    case SabotageType.LIGHTS_OUT:
      // Turn off lights (reduces vision)
      if (!gameState.currentSabotage) {
        gameState.currentSabotage = {
          type: SabotageType.LIGHTS_OUT,
          targetLocation: 'cafeteria',
          timestamp: Date.now(),
          cooldownRemaining: DEFAULT_CONFIG.sabotageCooldown,
        };
        console.log('Lights sabotaged in cafeteria');
      }
      break;

    case SabotageType.OXYGEN_SABOTAGE:
      // Reduce oxygen (time limit for crewmates)
      if (!gameState.currentSabotage) {
        gameState.currentSabotage = {
          type: SabotageType.OXYGEN_SABOTAGE,
          targetLocation: 'oxygen',
          timestamp: Date.now(),
          cooldownRemaining: DEFAULT_CONFIG.sabotageCooldown,
        };
        console.log('Oxygen sabotaged in oxygen');
      }
      break;

    case SabotageType.REACTOR_MALFUNCTION:
      // Reactor failure (immediate elimination)
      if (!gameState.currentSabotage) {
        gameState.currentSabotage = {
          type: SabotageType.REACTOR_MALFUNCTION,
          targetLocation: 'reactor',
          timestamp: Date.now(),
          cooldownRemaining: DEFAULT_CONFIG.sabotageCooldown,
        };
        console.log('Reactor sabotaged - immediate elimination in 10s');
      }
      break;

    case SabotageType.DOOR_LOCK:
      // Lock doors (traps crewmates)
      if (!gameState.currentSabotage) {
        gameState.currentSabotage = {
          type: SabotageType.DOOR_LOCK,
          targetLocation: 'security',
          timestamp: Date.now(),
          cooldownRemaining: DEFAULT_CONFIG.sabotageCooldown,
        };
        console.log('Doors sabotaged in security');
      }
      break;
  }
}

// Eliminate a player
function eliminatePlayer(playerId: number): void {
  const updatedAgents = gameState.agents.map(agent => {
    if (agent.id === playerId) {
      return { ...agent, isAlive: false };
    }
    return agent;
  });
  gameState.agents = updatedAgents;
}

// Check win conditions
export function checkWinConditions(): void {
  const aliveAgents = gameState.agents.filter(a => a.isAlive);
  const aliveImpostors = aliveAgents.filter(a => a.role === AgentRole.IMPOSTOR);
  const aliveCrewmates = aliveAgents.filter(a => a.role === AgentRole.CREWMATE || a.role === AgentRole.SHERIFF || a.role === AgentRole.DOCTOR || a.role === AgentRole.ENGINEER);

  // Check impostor win
  if (aliveImpostors.length >= aliveCrewmates.length) {
    gameState.winner = Winner.IMPOSTOR;
    gameState.phase = GamePhase.COMPLETED;
    console.log('IMPOSTORS WIN!');
  }

  // Check crewmate win
  if (aliveImpostors.length === 0) {
    gameState.winner = Winner.CREWMATES;
    gameState.phase = GamePhase.COMPLETED;
    console.log('CREWMATES WIN!');
  }
}
