'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Trophy, Crown } from 'lucide-react';

interface TeamData {
  id: string;
  name: string;
  logo_url: string | null;
  manager?: {
    discord_username: string;
    pro_clubs_name: string;
  };
  players: Array<{
    id: string;
    discord_username: string;
    pro_clubs_name: string;
    position: string;
  }>;
  player_count: number;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      // Fetch teams with their managers and players
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (teamsError) throw teamsError;

      // For each team, fetch manager and players
      const teamsWithDetails = await Promise.all(
        teamsData.map(async (team) => {
          // Fetch manager
          const { data: managerData } = await supabase
            .from('manager_assignments')
            .select('profiles(discord_username, pro_clubs_name)')
            .eq('team_id', team.id)
            .single();

          // Fetch players
          const { data: playersData } = await supabase
            .from('team_memberships')
            .select(`
              profiles(
                id,
                discord_username,
                pro_clubs_name,
                position
              )
            `)
            .eq('team_id', team.id);

          return {
            ...team,
            manager: managerData?.profiles || null,
            players: playersData?.map(p => p.profiles).filter(Boolean) || [],
            player_count: playersData?.length || 0,
          } as TeamData;
        })
      );

      setTeams(teamsWithDetails);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Teams
          </h1>
          <p className="text-gray-300 text-lg">
            Explore all teams in the Competitive E-Sports League
          </p>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card 
              key={team.id} 
              className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">{team.name}</CardTitle>
                {team.manager && (
                  <div className="flex items-center justify-center gap-2 text-sm text-yellow-400">
                    <Crown className="h-4 w-4" />
                    <span>{team.manager.discord_username}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Team Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Users className="h-4 w-4" />
                    <span>{team.player_count} Players</span>
                  </div>
                  <Badge 
                    variant={team.player_count >= 11 ? "default" : "secondary"}
                    className={team.player_count >= 11 ? "bg-green-600" : "bg-yellow-600"}
                  >
                    {team.player_count >= 11 ? "Full Squad" : "Recruiting"}
                  </Badge>
                </div>

                {/* Players Preview */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Squad</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {team.players.slice(0, 5).map((player) => (
                      <Link
                        key={player.id}
                        href={`/player/${player.id}`}
                        className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-purple-600">
                            {player.pro_clubs_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">
                            {player.pro_clubs_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {player.position}
                          </p>
                        </div>
                      </Link>
                    ))}
                    {team.players.length > 5 && (
                      <p className="text-xs text-gray-400 text-center py-1">
                        +{team.players.length - 5} more players
                      </p>
                    )}
                    {team.players.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No players assigned yet
                      </p>
                    )}
                  </div>
                </div>

                {/* View Full Squad Button */}
                <div className="pt-2">
                  <Link 
                    href={`/teams/${team.id}`}
                    className="w-full block text-center py-2 px-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-purple-300 rounded-lg hover:from-purple-600/30 hover:to-blue-600/30 transition-all"
                  >
                    View Full Squad
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Teams Found</h3>
            <p className="text-gray-500">Teams will appear here once they are created.</p>
          </div>
        )}
      </div>
    </div>
  );
}