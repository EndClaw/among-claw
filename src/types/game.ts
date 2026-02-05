// Core Game Types for Among Claw

export enum GamePhase {
  WAITING = "waiting",
  EMERGENCY_MEETING = "emergency_meeting",
  VOTING = "voting",
  DISCUSSION = "discussion",
  COMPLETED = "completed",
}

export enum AgentRole {
  CREWMATE = "crewmate",
  IMPOSTOR = "impostor",
  SHERIFF = "sheriff",
  DOCTOR = "doctor",
  ENGINEER = "engineer",
}

export type Agent = {
  id: number;
  role: AgentRole;
  isAlive: boolean;
  votesReceived: number;
  voteTarget: number | null;
  tasksCompleted: number;
  isImpostor: boolean; // Private - only impostor knows this

  // Specific abilities
  tasks: Task[]; // Crewmates' current tasks
  emergencyCooldownRemaining?: number; // Sheriff ability - seconds until can call emergency
  revivedPlayers?: number[]; // Doctor - who they've revived
  sabotageFixCount?: number; // Engineer - how many sabotages fixed
  isProtected?: boolean; // Sheriff voted target is protected (one-time protection)
  killCooldownRemaining?: number; // Impostor - seconds until can kill again
};

export type Task = {
  id: string;
  description: string;
  location: string;
  completed: boolean;
  type: 'repair' | 'clean' | 'fuel' | 'data' | 'navigate';
};

export type Vote = {
  voterId: number;
  targetId: number;
  timestamp: number;
  transactionSignature?: string; // On-chain proof
};

export type SabotageAction = {
  type: SabotageType;
  targetId?: number;
  targetLocation?: string; // For sabotage locations
  timestamp: number;
  cooldownRemaining?: number; // For abilities with cooldown
};

export enum SabotageType {
  // Impostor Sabotages
  KILL = "kill",
  VENT_SABOTAGE = "vent_sabotage",
  LIGHTS_OUT = "lights_out",
  OXYGEN_SABOTAGE = "oxygen_sabotage",
  REACTOR_MALFUNCTION = "reactor_malfunction",
  DOOR_LOCK = "door_lock",
  FAKE_REPORT = "fake_report",

  // Impostor Kill Methods
  KILL_MELEE = "kill_melee",
  KILL_VENT = "kill_vent",
  KILL_BLINDSIDE = "kill_blindside",
  KILL_SABOTAGE_TRAIL = "kill_sabotage_trail",

  // Crewmate Abilities
  SCAN_BODY = "scan_body",
  TRACK_VOTES = "track_votes",
  PROTECT_PLAYER = "protect_player",
};

export type GameEvent = {
  type: 'kill' | 'sabotage' | 'task_completed' | 'meeting_called' | 'vote_cast' | 'player_eliminated' | 'impostor_revealed' | 'ability_used';
  agentId?: number;
  description: string;
  timestamp: number;
  data?: any;
};

export type GameState = {
  phase: GamePhase;
  agents: Agent[];
  votes: Vote[];
  emergencyCaller: number | null;
  round: number;
  startTime: number;
  totalRounds: number;
  impostorsEliminated: number;
  crewmatesRemaining: number;

  // Game state extensions
  currentSabotage: SabotageAction | null;
  tasksAssigned: Task[];
  emergencyCooldownRemaining: number; // Global cooldown after meeting

  // Game result
  winner: 'impostors' | 'crewmates' | null;
};

export type GameConfig = {
  totalPlayers: number;
  totalRounds: number;
  impostorCount: number;
  emergencyCooldown: number; // Seconds between emergency meetings
  votingDuration: number; // Seconds for voting phase
  discussionDuration: number; // Seconds for discussion phase
  killCooldown: number; // Impostor kill cooldown in seconds
  sabotageCooldown: number; // Sabotage cooldown in seconds
  sheriffVoteWeight: number; // Sheriff's votes count 2x
  doctorReviveLimit: number; // Max revives per game
  engineerFixSpeed: number; // Speed multiplier for sabotage fixes
  enableSheriff: boolean;
  enableDoctor: boolean;
  enableEngineer: boolean;
};

export const DEFAULT_CONFIG: GameConfig = {
  totalPlayers: 10,
  impostorCount: 2,
  emergencyCooldown: 30,
  votingDuration: 60,
  discussionDuration: 30,
  killCooldown: 30, // Impostor cooldown
  sabotageCooldown: 45, // Sabotage cooldown
  sheriffVoteWeight: 2, // Sheriff votes 2x
  doctorReviveLimit: 1, // Can revive 1 player per game
  engineerFixSpeed: 2, // Fixes sabotage 2x faster
  enableSheriff: true,
  enableDoctor: true,
  enableEngineer: true,
};
