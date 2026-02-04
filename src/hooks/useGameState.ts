"use client";

import { useState, useEffect, useCallback } from 'react';
import { type GameState, type Agent, DEFAULT_CONFIG } from '@/types/game';

/**
 * Hook for managing Among Claw game state
 *
 * Handles game phases, agent states, voting, and win conditions
 */

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'waiting' as any,
    agents: [],
    votes: [],
    emergencyCaller: null,
    round: 0,
    startTime: Date.now(),
    totalRounds: DEFAULT_CONFIG.totalRounds,
    impostorsEliminated: 0,
    crewmatesRemaining: 0,
  });

  const [currentPlayerId, setCurrentPlayerId] = useState<number | null>(null);

  // Initialize game with players
  const initializeGame = useCallback((playerAddresses: string[]) => {
    const newAgents = playerAddresses.map((address, index) => ({
      id: index + 1,
      role: 'crewmate' as any, // Will be assigned randomly
      isAlive: true,
      votesReceived: 0,
      voteTarget: null,
      tasksCompleted: 0,
      isImpostor: false,
    }));

    setGameState(prev => ({
      ...prev,
      phase: 'waiting' as any,
      agents: newAgents,
      votes: [],
      emergencyCaller: null,
      round: 0,
      startTime: Date.now(),
      totalRounds: DEFAULT_CONFIG.totalRounds,
      impostorsEliminated: 0,
      crewmatesRemaining: playerAddresses.length - DEFAULT_CONFIG.impostorCount,
    }));

    console.log('Game initialized with', playerAddresses.length, 'players');
  }, []);

  // Assign roles randomly (impostors + special roles)
  const assignRoles = useCallback(() => {
    setGameState(prev => {
      const shuffled = [...prev.agents].sort(() => Math.random() - 0.5);
      const impostorCount = DEFAULT_CONFIG.impostorCount;

      // Assign impostors
      for (let i = 0; i < impostorCount; i++) {
        shuffled[i].role = 'impostor' as any;
        (shuffled[i] as any).isImpostor = true;
      }

      // Assign special roles if enabled
      let roleIndex = impostorCount;
      if (DEFAULT_CONFIG.enableSheriff && roleIndex < shuffled.length) {
        shuffled[roleIndex].role = 'sheriff' as any;
        roleIndex++;
      }

      if (DEFAULT_CONFIG.enableDoctor && roleIndex < shuffled.length) {
        shuffled[roleIndex].role = 'doctor' as any;
        roleIndex++;
      }

      if (DEFAULT_CONFIG.enableEngineer && roleIndex < shuffled.length) {
        shuffled[roleIndex].role = 'engineer' as any;
        roleIndex++;
      }

      console.log('Roles assigned:', shuffled.map(a => ({ id: a.id, role: a.role })));

      return { ...prev, agents: shuffled };
    });
  }, []);

  // Start voting phase
  const startVotingPhase = useCallback(() => {
    setGameState(prev => {
      // Reset votes for new round
      const resetAgents = prev.agents.map(agent => ({
        ...agent,
        voteTarget: null,
      }));

      return {
        ...prev,
        phase: 'voting' as any,
        agents: resetAgents,
        votes: [],
      };
    });

    // Auto-start discussion phase after voting duration
    setTimeout(() => {
      setGameState(prev => {
        if (prev.phase === 'voting') {
          const voteCount = new Map<number, number>();
          prev.votes.forEach(vote => {
            const count = voteCount.get(vote.targetId as number) || 0;
            voteCount.set(vote.targetId as number, count + 1);
          });

          // Find most voted player
          let maxVotes = 0;
          let eliminatedId: number | null = null;

          voteCount.forEach((count, playerId) => {
            if (count > maxVotes) {
              maxVotes = count;
              eliminatedId = playerId as number;
            }
          });

          // Eliminate player
          if (eliminatedId !== null) {
            const updatedAgents = prev.agents.map(agent => {
              if (agent.id === eliminatedId) {
                return { ...agent, isAlive: false };
              }
              return agent;
            });

            const eliminatedAgent = prev.agents.find(a => a.id === eliminatedId);
            const newImpostorsEliminated = eliminatedAgent?.isImpostor
              ? prev.impostorsEliminated + 1
              : prev.impostorsEliminated;
            const newCrewmatesRemaining = !eliminatedAgent?.isImpostor
              ? prev.crewmatesRemaining - 1
              : prev.crewmatesRemaining;

            // Check win conditions
            const aliveImpostors = updatedAgents.filter(a => a.isImpostor && a.isAlive);
            const aliveCrewmates = updatedAgents.filter(a => !a.isImpostor && a.isAlive);

            let newPhase = 'discussion' as any;
            if (aliveImpostors.length === 0 || aliveCrewmates.length <= aliveImpostors.length) {
              newPhase = 'completed' as any;
            }

            return {
              ...prev,
              phase: newPhase,
              agents: updatedAgents,
              impostorsEliminated: newImpostorsEliminated,
              crewmatesRemaining: newCrewmatesRemaining,
            };
          }

          return prev;
        }
      });
    }, DEFAULT_CONFIG.votingDuration * 1000);
  }, [DEFAULT_CONFIG.votingDuration]);

  // Call emergency meeting
  const callEmergencyMeeting = useCallback((callerId: number) => {
    setGameState(prev => ({
      ...prev,
      phase: 'emergency_meeting' as any,
      emergencyCaller: callerId,
      round: prev.round + 1,
    }));

    console.log('Emergency meeting called by', callerId);
  }, []);

  // Cast a vote
  const castVote = useCallback((voterId: number, targetId: number) => {
    setGameState(prev => {
      const voter = prev.agents.find(a => a.id === voterId);
      const target = prev.agents.find(a => a.id === targetId);

      if (!voter || !target || !voter.isAlive) {
        return prev; // Invalid vote
      }

      if (prev.phase !== 'voting') {
        return prev; // Not in voting phase
      }

      const updatedVoter = { ...voter, voteTarget: targetId };
      const updatedAgents = prev.agents.map(agent => {
        if (agent.id === voterId) {
          return updatedVoter;
        }
        return agent;
      });

      const newVote = {
        voterId,
        targetId,
        timestamp: Date.now(),
      };

      const newVotes = [...prev.votes, newVote];

      // Check if all alive players have voted
      const aliveAgents = updatedAgents.filter(a => a.isAlive);
      const votedCount = aliveAgents.filter(a => a.voteTarget !== null).length;

      if (votedCount === aliveAgents.length) {
        // Transition to discussion phase
        return {
          ...prev,
          agents: updatedAgents,
          votes: newVotes,
        };
      }

      return {
        ...prev,
        agents: updatedAgents,
        votes: newVotes,
      };
    });

    console.log('Vote cast:', { voterId, targetId });
  }, []);

  // Eliminate a player
  const eliminatePlayer = useCallback((playerId: number) => {
    setGameState(prev => {
      const updatedAgents = prev.agents.map(agent => {
        if (agent.id === playerId) {
          return { ...agent, isAlive: false };
        }
        return agent;
      });

      const eliminatedAgent = prev.agents.find(a => a.id === playerId);
      const newImpostorsEliminated = eliminatedAgent?.isImpostor
        ? prev.impostorsEliminated + 1
        : prev.impostorsEliminated;
      const newCrewmatesRemaining = !eliminatedAgent?.isImpostor
        ? prev.crewmatesRemaining - 1
        : prev.crewmatesRemaining;

      // Check win conditions
      const aliveImpostors = updatedAgents.filter(a => a.isImpostor && a.isAlive);
      const aliveCrewmates = updatedAgents.filter(a => !a.isImpostor && a.isAlive);

      let newPhase = prev.phase;
      if (aliveImpostors.length === 0) {
        newPhase = 'completed' as any;
      } else if (aliveCrewmates.length <= aliveImpostors.length) {
        newPhase = 'completed' as any;
      }

      return {
        ...prev,
        phase: newPhase,
        agents: updatedAgents,
        impostorsEliminated: newImpostorsEliminated,
        crewmatesRemaining: newCrewmatesRemaining,
      };
    });

    console.log('Player eliminated:', playerId);
  }, []);

  // Reset game state
  const resetGame = useCallback(() => {
    setGameState({
      phase: 'waiting' as any,
      agents: [],
      votes: [],
      emergencyCaller: null,
      round: 0,
      startTime: Date.now(),
      totalRounds: DEFAULT_CONFIG.totalRounds,
      impostorsEliminated: 0,
      crewmatesRemaining: 0,
    });
    setCurrentPlayerId(null);
    console.log('Game reset');
  }, []);

  return {
    // Game state
    gameState,
    currentPlayerId,

    // Actions
    initializeGame,
    assignRoles,
    startVotingPhase,
    callEmergencyMeeting,
    castVote,
    eliminatePlayer,
    resetGame,
  };
}
