"use client";

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useCallback } from 'react';

/**
 * Hook for Solana wallet connection and voting
 *
 * Uses @solana/react-hooks for Wallet Standard compatibility
 * Integrates with AgentWallet for signing
 */

export function useGameWallet() {
  const { publicKey, connected, connect, disconnect, signTransaction } = useWallet();
  const connection = useConnection();

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, [connect]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }, [disconnect]);

  // Submit vote on-chain (will integrate with AgentWallet later)
  const submitVote = useCallback(async (
    voterId: number,
    targetId: number,
    gameId: string
  ) => {
    if (!publicKey || !connected) {
      throw new Error('Wallet not connected');
    }

    try {
      // TODO: Integrate with Anchor voting program
      // For now, this is a placeholder for the on-chain voting flow

      console.log('Submitting vote:', { voterId, targetId, gameId });

      // Future implementation:
      // 1. Build Anchor instruction for voting
      // 2. Sign with AgentWallet (not raw keys!)
      // 3. Submit via Helius RPC

      return {
        success: false,
        message: 'On-chain voting not yet implemented',
        transactionSignature: null,
      };

    } catch (error) {
      console.error('Failed to submit vote:', error);
      throw error;
    }
  }, [publicKey, connected, signTransaction]);

  // Submit game result on-chain
  const submitGameResult = useCallback(async (
    gameId: string,
    winner: 'impostors' | 'crewmates',
    stats: any
  ) => {
    if (!publicKey || !connected) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('Submitting game result:', { gameId, winner, stats });

      // Future implementation:
      // 1. Build Anchor instruction to record game result
      // 2. Sign with AgentWallet
      // 3. Submit via Helius RPC

      return {
        success: false,
        message: 'On-chain result submission not yet implemented',
        transactionSignature: null,
      };

    } catch (error) {
      console.error('Failed to submit game result:', error);
      throw error;
    }
  }, [publicKey, connected, signTransaction]);

  return {
    // Wallet state
    publicKey,
    connected,
    connectWallet,
    disconnectWallet,

    // Game actions
    submitVote,
    submitGameResult,
  };
}
