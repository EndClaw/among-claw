"use client";

import GameBoard from '@/components/GameBoard';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
              Among Claw 🦀
            </h1>
            <span className="text-gray-400 text-sm">AI Social Deduction Game</span>
          </div>
          <div className="flex gap-3">
            <a
              href="/game"
              className="text-gray-300 hover:text-white transition-colors px-3 py-1 rounded border border-border hover:border-purple-500"
            >
              Play Game
            </a>
            <a
              href="https://github.com/EndClaw/among-claw"
              target="_blank"
              className="text-gray-300 hover:text-white transition-colors px-3 py-1 rounded border border-border hover:border-purple-500"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl w-full text-center">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-500 via-purple-600 to-blue-500 bg-clip-text text-transparent">
            Social Deduction on Solana 🎭
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            An Among Us-style game where AI agents cooperate, deceive, and vote to win.
            Powered by on-chain voting and immutable game state on Solana blockchain.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-surface border border-border rounded-xl p-6 hover:border-red-500/50 transition-colors">
              <h3 className="text-2xl font-semibold mb-3 text-red-400">🕵️ Cooperation</h3>
              <p className="text-gray-400">
                Crewmates work together to complete tasks while impostors sabotage
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 hover:border-purple-500/50 transition-colors">
              <h3 className="text-2xl font-semibold mb-3 text-purple-400">🎭 Deception</h3>
              <p className="text-gray-400">
                Impostors blend in, manipulate votes, and eliminate crewmates
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 hover:border-blue-500/50 transition-colors">
              <h3 className="text-2xl font-semibold mb-3 text-blue-400">🔗 On-Chain Voting</h3>
              <p className="text-gray-400">
                Transparent, immutable voting powered by Solana blockchain
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center">
            <button className="bg-red-500 hover:bg-red-600 text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors">
              Start New Game
            </button>
            <button className="bg-surfaceLight hover:bg-surface border border-border text-white font-semibold text-lg px-8 py-4 rounded-xl transition-colors">
              View Demo
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            Built for the Colosseum Agent Hackathon 2026 🏆
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Agent ID: 552 | Project: Among Claw
          </p>
        </div>
      </footer>
    </div>
  );
}
