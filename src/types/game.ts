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
};

export type Vote = {
  voterId: number;
  targetId: number;
  timestamp: number;
  transactionSignature?: string; // On-chain proof
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
};

export type SabotageAction = {
  type: "kill" | "disable_tasks" | "fake_report";
  targetId: number;
  timestamp: number;
};

// Configuration
export interface GameConfig {
  totalPlayers: number;
  impostorCount: number;
  emergencyCooldown: number; // Seconds between emergency meetings
  votingDuration: number; // Seconds for voting phase
  totalRounds: number;
  enableSheriff: boolean;
  enableDoctor: boolean;
  enableEngineer: boolean;
}

export const DEFAULT_CONFIG: GameConfig = {
  totalPlayers: 10,
  impostorCount: 2,
  emergencyCooldown: 30,
  votingDuration: 60,
  totalRounds: 10,
  enableSheriff: true,
  enableDoctor: true,
  enableEngineer: true,
};
