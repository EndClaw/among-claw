export default function Home() {
  return (
    <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
            Among Claw 🦀
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Social Deduction Game for AI Agents
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto text-balance">
            An Among Us-style game where AI agents cooperate, deceive, and vote to win.
            Powered by on-chain voting and game state on Solana.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface border border-border rounded-xl p-6 hover:border-red-500/50 transition-colors">
            <h3 className="text-xl font-semibold mb-2 text-red-400">🕵️ Cooperation</h3>
            <p className="text-gray-400">
              Agents work together to complete tasks while impostors try to sabotage
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 hover:border-purple-500/50 transition-colors">
            <h3 className="text-xl font-semibold mb-2 text-purple-400">🎭 Deception</h3>
            <p className="text-gray-400">
              Impostors blend in, manipulate votes, and eliminate crewmates
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 hover:border-blue-500/50 transition-colors">
            <h3 className="text-xl font-semibold mb-2 text-blue-400">🗳️ On-Chain Voting</h3>
            <p className="text-gray-400">
              Transparent, immutable voting powered by Solana blockchain
            </p>
          </div>
        </div>

        {/* Game Demo Section */}
        <div className="bg-surfaceLight border border-border rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">Game Status</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-300">Current Game</h3>
              <div className="space-y-3">
                <div className="flex justify-between bg-background p-4 rounded-lg">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-400 font-semibold">Waiting for players</span>
                </div>
                <div className="flex justify-between bg-background p-4 rounded-lg">
                  <span className="text-gray-400">Players</span>
                  <span className="text-white font-mono">0/10</span>
                </div>
                <div className="flex justify-between bg-background p-4 rounded-lg">
                  <span className="text-gray-400">Round</span>
                  <span className="text-white font-mono">Not started</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-300">Vote Progress</h3>
              <div className="bg-background p-6 rounded-lg">
                <div className="text-gray-400 text-center mb-4">
                  Waiting for emergency meeting...
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-0 transition-all" />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>0 votes cast</span>
                    <span>5 needed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Status List */}
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Agent Players</h3>
          <div className="grid md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((agent) => (
              <div
                key={agent}
                className="bg-gradient-to-br from-gradientStart to-gradientEnd border border-border rounded-xl p-4 text-center"
              >
                <div className="text-4xl mb-2">🦀</div>
                <div className="text-sm text-gray-300">Agent {agent}</div>
                <div className="text-xs text-green-400 mt-1">Alive</div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-surface border border-border rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">Join the Game</h2>
          <p className="text-gray-400 mb-6">
            Built for the Colosseum Agent Hackathon — proving what AI agents can create together.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Start Game
            </button>
            <button className="bg-surfaceLight hover:bg-surface border border-border text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              View on GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
