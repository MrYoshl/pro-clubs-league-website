'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { User, Search, Trophy, Target, Users } from 'lucide-react';

interface PlayerData {
  id: string;
  discord_username: string;
  pro_clubs_name: string;
  position: string;
  goals: number;
  assists: number;
  average_rating: number;
  team?: {
    id: string;
    name: string;
  };
}

const POSITIONS = [
  'All', 'GK', 'LB', 'CB', 'RB', 'LWB', 'RWB', 
  'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'
];

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [selectedTeam, setSelectedTeam] = useState('All');
  const [teams, setTeams] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterPlayers();
  }, [players, searchTerm, selectedPosition, selectedTeam]);

  const fetchData = async () => {
    try {
      // Fetch players with team information
      const { data: playersData, error: playersError } = await supabase
        .from('profiles')
        .select(`
          *,
          team_memberships(
            teams(id, name)
          )
        `)
        .order('pro_clubs_name');

      if (playersError) throw playersError;

      // Fetch teams for filter
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name')
        .order('name');

      if (teamsError) throw teamsError;

      // Defensive: filter out players with no id
      const processedPlayers = (playersData || [])
        .filter(player => !!player.id && typeof player.id === 'string')
        .map(player => ({
          ...player,
          team: player.team_memberships?.[0]?.teams || null,
        }));

      setPlayers(processedPlayers);
      setTeams(teamsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPlayers = () => {
    let filtered = players;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(player =>
        player.pro_clubs_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.discord_username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Position filter
    if (selectedPosition && selectedPosition !== 'All') {
      filtered = filtered.filter(player => player.position === selectedPosition);
    }

    // Team filter
    if (selectedTeam && selectedTeam !== 'All') {
      if (selectedTeam === 'Free Agent') {
        filtered = filtered.filter(player => !player.team);
      } else {
        filtered = filtered.filter(player => player.team?.id === selectedTeam);
      }
    }

    setFilteredPlayers(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-700 rounded-lg"></div>
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Players
          </h1>
          <p className="text-gray-300 text-lg">
            Browse all registered players in the league
          </p>
        </div>

        {/* Filters */}
        <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {POSITIONS.map(position => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="All">All Teams</SelectItem>
                <SelectItem value="Free Agent">Free Agents</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-400 flex items-center justify-center">
              {filteredPlayers.length} of {players.length} players
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) =>
            player.id ? (
              <Link key={player.id} href={`/player/${player.id}`}>
                <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-purple-600 text-white">
                          {player.pro_clubs_name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">
                          {player.pro_clubs_name}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">
                          @{player.discord_username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <Badge 
                        variant="outline" 
                        className="border-purple-500/30 text-purple-300"
                      >
                        {player.position}
                      </Badge>
                      {player.team ? (
                        <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                          {player.team.name}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-600/20 text-gray-300">
                          Free Agent
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <Target className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="text-lg font-bold text-white">{player.goals}</div>
                        <div className="text-xs text-gray-400">Goals</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <Users className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="text-lg font-bold text-white">{player.assists}</div>
                        <div className="text-xs text-gray-400">Assists</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <Trophy className="h-4 w-4 text-yellow-400" />
                        </div>
                        <div className="text-lg font-bold text-white">
                          {player.average_rating?.toFixed(1) ?? '0.0'}
                        </div>
                        <div className="text-xs text-gray-400">Rating</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : null // Skip players with no id
          )}
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-16">
            <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Players Found</h3>
            <p className="text-gray-500">
              Try adjusting your search filters or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}