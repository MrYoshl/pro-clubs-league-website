import { Trophy, Users, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="p-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
              <Trophy className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Competitive E-Sports League
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The ultimate FIFA Pro Clubs league featuring the best teams and players. 
            Join the league, track stats, and climb the rankings.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
              View League Table
            </button>
            <button className="px-8 py-3 border border-purple-400 text-purple-400 rounded-lg font-semibold hover:bg-purple-400 hover:text-white transition-all duration-200">
              Browse Teams
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Active Teams</CardTitle>
                <Users className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">6</div>
                <p className="text-xs text-gray-400">Professional clubs competing</p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-blue-500/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Registered Players</CardTitle>
                <Award className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">132</div>
                <p className="text-xs text-gray-400">Elite Pro Clubs players</p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-green-500/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Matches Played</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">48</div>
                <p className="text-xs text-gray-400">Competitive fixtures</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Latest Updates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="text-sm text-purple-400 mb-2">January 15, 2025</div>
                <CardTitle className="text-white">Season 2025 Kicks Off</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  The new season has officially begun with 6 teams competing for the championship title. 
                  Registration is still open for qualified free agents.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <div className="text-sm text-blue-400 mb-2">January 12, 2025</div>
                <CardTitle className="text-white">New Player Stats System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Enhanced player statistics tracking is now live. Team managers can update 
                  player stats including goals, assists, and average ratings.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-green-500/50 transition-colors">
              <CardHeader>
                <div className="text-sm text-green-400 mb-2">January 10, 2025</div>
                <CardTitle className="text-white">Free Agent Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  The admin team is actively reviewing free agent applications. 
                  Approved players will be eligible for team assignments.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* League Table Placeholder */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            League Table
          </h2>
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-lg bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                  <Trophy className="h-16 w-16 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">League Table Coming Soon</h3>
                <p className="text-gray-300 max-w-md mx-auto">
                  The official league standings will be displayed here once the season progresses. 
                  Stay tuned for live updates on team positions and points.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}