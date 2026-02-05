"use client";

import { useGameState } from '@/hooks/useGameState';
import { useGameWallet } from '@/hooks/useGameWallet';
import { GamePhase, AgentRole } from '@/types/game';

const getPhaseText = (phase: string): string => {
  switch (phase) {
    case 'WAITING':
      return 'WAITING';
    case 'EMERGENCY_MEETING':
      return 'EMERGENCY_MEETING';
    case 'VOTING':
      return 'VOTING';
    case 'DISCUSSION':
      return 'DISCUSSION';
    case 'COMPLETED':
      return 'COMPLETED';
    default:
      return phase.toUpperCase();
  }
};

export default function GameBoard() {
  const { gameState, currentPlayerId, initializeGame, assignRoles, startVotingPhase, callEmergencyMeeting, castVote, eliminatePlayer } = useGameState();
  const { connected, connectWallet, submitVote } = useGameWallet();

  const handleVote = (targetId: number) => {
    if (gameState.phase === GamePhase.VOTING) {
      submitVote(currentPlayerId || 1, targetId, 'game-id');
    }
  };

  const handleEmergency = () => {
    if (gameState.phase === GamePhase.WAITING) {
      callEmergencyMeeting(currentPlayerId || 1);
    }
  };

  const getRoleEmoji = (role: AgentRole): string => {
    switch (role) {
      case AgentRole.CREWMATE:
        return '👷';
      case AgentRole.IMPOSTOR:
        return '👾';
      case AgentRole.SHERIFF:
        return '👮';
      case AgentRole.DOCTOR:
        return '🩺';
      case AgentRole.ENGINEER:
        return '🔧';
      default:
        return '🦀';
    }
  };

  const getPhaseColor = (phase: GamePhase): string => {
    switch (phase) {
      case GamePhase.WAITING:
        return 'text-blue-400';
      case GamePhase.EMERGENCY_MEETING:
        return 'text-red-400';
      case GamePhase.VOTING:
        return 'text-purple-400';
      case GamePhase.DISCUSSION:
        return 'text-yellow-400';
      case GamePhase.COMPLETED:
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-background text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
            Among Claw 🦀
          </h1>
          <div className="flex gap-4">
            {connected ? (
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                ✓ Connected
              </span>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Game Info Bar */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-6 grid grid-cols-4 gap-4">
          <div>
            <div className="text-gray-400 text-sm">Phase</div>
            <div className={`font-semibold ${getPhaseColor(gameState.phase)}`}>
              {gameState.phase.replace(/_/g, ' ').toUpperCase()}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Round</div>
            <div className="font-mono text-white">
              {gameState.round} / {gameState.totalRounds}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Impostors Eliminated</div>
            <div className="font-mono text-red-400">
              {gameState.impostorsEliminated} / {gameState.agents.filter(a => a.isImpostor).length}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Alive</div>
            <div className="font-mono text-white">
              {gameState.agents.filter(a => a.isAlive).length} / {gameState.agents.length}
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          {gameState.agents.map((agent) => (
            <div
              key={agent.id}
              className={`
                bg-surface border border-border rounded-xl p-4
                ${!agent.isAlive ? 'opacity-50 grayscale' : ''}
                hover:border-purple-500/50 transition-colors
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-4xl mb-1">
                    {getRoleEmoji(agent.role)}
                  </div>
                  <div className="text-sm text-gray-300">Agent {agent.id}</div>
                </div>
                {!agent.isAlive && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                    ELIMINATED
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Alive</span>
                  <span className={agent.isAlive ? 'text-green-400' : 'text-red-400'}>
                    {agent.isAlive ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Votes</span>
                  <span className="text-white font-mono">{agent.votesReceived}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tasks</span>
                  <span className="text-white font-mono">{agent.tasksCompleted}</span>
                </div>
              </div>

              {/* Vote Button (only during voting phase and if agent is alive) */}
              {gameState.phase === GamePhase.VOTING && agent.isAlive && (
                <button
                  onClick={() => handleVote(agent.id)}
                  className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg transition-colors"
                >
                  Vote for Agent {agent.id}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Action Bar */}
        {gameState.phase === GamePhase.WAITING && connected && (
          <button
            onClick={handleEmergency}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl transition-colors"
          >
            🚨 Call Emergency Meeting
          </button>
        )}

        {/* Game Result */}
        {gameState.phase === GamePhase.COMPLETED && (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center">
            <h2 className="text-4xl font-bold mb-4">
              {gameState.winner === 'impostors' ? '👾 Impostors Win!' : '👷 Crewmates Win!'}
            </h2>
            <div className="text-gray-400 mb-6">
              Game completed in {gameState.totalRounds} rounds
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="bg-background p-4 rounded-lg">
                <h3 className="text-red-400 font-semibold mb-2">Impostors Eliminated</h3>
                <div className="text-2xl font-mono">
                  {gameState.impostorsEliminated}
                </div>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <h3 className="text-green-400 font-semibold mb-2">Total Votes Cast</h3>
                <div className="text-2xl font-mono">
                  {gameState.votes.length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
