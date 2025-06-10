'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { UserCog, Users, UserPlus, Edit, Target, Trophy, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ManagedTeam {
  id: string;
  name: string;
  players: Array<{
    id: string;
    discord_username: string;
    pro_clubs_name: string;
    position: string;
    goals: number;
    assists: number;
    average_rating: number;
  }>;
}

interface ApprovedFreeAgent {
  id: string;
  discord_username: string;
  pro_clubs_name: string;
  position: string;
}

export default function ManagerPage() {
  const { user, isManager, loading } = useAuth();
  const router = useRouter();
  const [managedTeams, setManagedTeams] = useState<ManagedTeam[]>([]);
  const [approvedFreeAgents, setApprovedFreeAgents] = useState<ApprovedFreeAgent[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [statForm, setStatForm] = useState({
    goals: 0,
    assists: 0,
    average_rating: 0,
  });

  useEffect(() => {
    if (!loading) {
      if (!isManager) {
        router.push('/');
        return;
      }
      fetchData();
    }
  }, [isManager, loading, router]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch teams managed by current user
      const { data: managerData } = await supabase
        .from('manager_assignments')
        .select(`
          teams(
            id,
            name,
            team_memberships(
              profiles(
                id,
                discord_username,
                pro_clubs_name,
                position,
                goals,
                assists,
                average_rating
              )
            )
          )
        `)
        .eq('user_id', user.id);

      // Fetch approved free agents
      const { data: freeAgentsData } = await supabase
        .from('free_agent_approvals')
        .select(`
          profiles(
            id,
            discord_username,
            pro_clubs_name,
            position
          )
        `)
        .eq('status', 'approved')
        .is('profiles.team_memberships', null);

      const teams = managerData?.map(m => ({
        id: m.teams.id,
        name: m.teams.name,
        players: m.teams.team_memberships?.map(tm => tm.profiles).filter(Boolean) || [],
      })) || [];

      const freeAgents = freeAgentsData?.map(fa => fa.profiles).filter(Boolean) || [];

      setManagedTeams(teams);
      setApprovedFreeAgents(freeAgents);
    } catch (error) {
      console.error('Error fetching manager data:', error);
      toast.error('Failed to load manager data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleAssignPlayer = async (playerId: string, teamId: string) => {
    try {
      const { error } = await supabase
        .from('team_memberships')
        .insert({
          player_id: playerId,
          team_id: teamId,
        });

      if (error) throw error;

      await fetchData(); // Refresh data
      toast.success('Player assigned to team successfully');
    } catch (error) {
      console.error('Error assigning player:', error);
      toast.error('Failed to assign player');
    }
  };

  const handleUpdateStats = async () => {
    if (!editingPlayer) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(statForm)
        .eq('id', editingPlayer);

      if (error) throw error;

      await fetchData(); // Refresh data
      setEditingPlayer(null);
      toast.success('Player stats updated successfully');
    } catch (error) {
      console.error('Error updating stats:', error);
      toast.error('Failed to update player stats');
    }
  };

  const openEditStats = (player: ManagedTeam['players'][0]) => {
    setEditingPlayer(player.id);
    setStatForm({
      goals: player.goals,
      assists: player.assists,
      average_rating: player.average_rating,
    });
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-12 bg-gray-700 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isManager) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600">
              <UserCog className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Manager Panel
          </h1>
          <p className="text-gray-300 text-lg">
            Manage your team roster and player statistics
          </p>
        </div>

        <Tabs defaultValue="team-roster" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="team-roster" className="data-[state=active]:bg-blue-600">
              Team Roster
            </TabsTrigger>
            <TabsTrigger value="free-agents" className="data-[state=active]:bg-blue-600">
              Sign Players
            </TabsTrigger>
          </TabsList>

          {/* Team Roster */}
          <TabsContent value="team-roster">
            {managedTeams.length === 0 ? (
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardContent className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">You are not currently managing any teams</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {managedTeams.map((team) => (
                  <Card key={team.id} className="bg-black/40 border-white/10 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {team.name} ({team.players.length} players)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {team.players.length === 0 ? (
                        <div className="text-center py-8">
                          <UserPlus className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">No players in this team yet</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Use the "Sign Players" tab to add approved free agents
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {team.players.map((player) => (
                            <div 
                              key={player.id}
                              className="flex items-center justify-between p-4 border border-gray-700 rounded-lg"
                            >
                              <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-purple-600">
                                    {player.pro_clubs_name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <Link 
                                    href={`/player/${player.id}`}
                                    className="font-semibold text-white hover:text-blue-400 transition-colors"
                                  >
                                    {player.pro_clubs_name}
                                  </Link>
                                  <p className="text-sm text-gray-400">
                                    @{player.discord_username}
                                  </p>
                                  <Badge 
                                    variant="outline" 
                                    className="border-purple-500/30 text-purple-300 mt-1"
                                  >
                                    {player.position}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-6">
                                {/* Player Stats */}
                                <div className="flex gap-4 text-sm">
                                  <div className="text-center">
                                    <div className="text-white font-semibold">{player.goals}</div>
                                    <div className="text-gray-400">Goals</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-white font-semibold">{player.assists}</div>
                                    <div className="text-gray-400">Assists</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-white font-semibold">
                                      {player.average_rating.toFixed(1)}
                                    </div>
                                    <div className="text-gray-400">Rating</div>
                                  </div>
                                </div>

                                {/* Edit Stats Button */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditStats(player)}
                                  className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Free Agents */}
          <TabsContent value="free-agents">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Available Free Agents ({approvedFreeAgents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {approvedFreeAgents.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No approved free agents available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {approvedFreeAgents.map((agent) => (
                      <div 
                        key={agent.id}
                        className="flex items-center justify-between p-4 border border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-green-600">
                              {agent.pro_clubs_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-white">
                              {agent.pro_clubs_name}
                            </h3>
                            <p className="text-sm text-gray-400">
                              @{agent.discord_username}
                            </p>
                            <Badge 
                              variant="outline" 
                              className="border-green-500/30 text-green-300 mt-1"
                            >
                              {agent.position}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {managedTeams.map((team) => (
                            <Button
                              key={team.id}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleAssignPlayer(agent.id, team.id)}
                            >
                              Sign to {team.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Stats Dialog */}
        <Dialog open={!!editingPlayer} onOpenChange={() => setEditingPlayer(null)}>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Player Statistics</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="goals" className="text-gray-300">Goals</Label>
                  <Input
                    id="goals"
                    type="number"
                    value={statForm.goals}
                    onChange={(e) => setStatForm(prev => ({ ...prev, goals: Number(e.target.value) }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="assists" className="text-gray-300">Assists</Label>
                  <Input
                    id="assists"
                    type="number"
                    value={statForm.assists}
                    onChange={(e) => setStatForm(prev => ({ ...prev, assists: Number(e.target.value) }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="rating" className="text-gray-300">Average Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={statForm.average_rating}
                    onChange={(e) => setStatForm(prev => ({ ...prev, average_rating: Number(e.target.value) }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={handleUpdateStats}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Update Stats
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setEditingPlayer(null)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}