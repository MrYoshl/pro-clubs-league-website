'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Shield, UserCheck, UserX, Crown, Users, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FreeAgent {
  id: string;
  discord_username: string;
  pro_clubs_name: string;
  position: string;
  status: string;
  created_at: string;
}

interface Manager {
  id: string;
  user_id: string;
  team_id: string;
  discord_username: string;
  pro_clubs_name: string;
  team_name: string;
}

interface TeamOption {
  id: string;
  name: string;
}

export default function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [freeAgents, setFreeAgents] = useState<FreeAgent[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [players, setPlayers] = useState<Array<{ id: string; discord_username: string; pro_clubs_name: string }>>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!isAdmin) {
        router.push('/');
        return;
      }
      fetchData();
    }
  }, [isAdmin, loading, router]);

  const fetchData = async () => {
    try {
      // Fetch free agents pending approval
      const { data: freeAgentsData } = await supabase
        .from('free_agent_approvals')
        .select(`
          id,
          status,
          created_at,
          profiles(
            id,
            discord_username,
            pro_clubs_name,
            position
          )
        `)
        .eq('status', 'pending');

      // Fetch current managers
      const { data: managersData } = await supabase
        .from('manager_assignments')
        .select(`
          id,
          user_id,
          team_id,
          profiles(discord_username, pro_clubs_name),
          teams(name)
        `);

      // Fetch teams
      const { data: teamsData } = await supabase
        .from('teams')
        .select('id, name')
        .order('name');

      // Fetch all players for manager assignment
      const { data: playersData } = await supabase
        .from('profiles')
        .select('id, discord_username, pro_clubs_name')
        .order('discord_username');

      setFreeAgents(
        freeAgentsData?.map(fa => ({
          id: fa.profiles.id,
          discord_username: fa.profiles.discord_username,
          pro_clubs_name: fa.profiles.pro_clubs_name,
          position: fa.profiles.position,
          status: fa.status,
          created_at: fa.created_at,
        })) || []
      );

      setManagers(
        managersData?.map(m => ({
          id: m.id,
          user_id: m.user_id,
          team_id: m.team_id,
          discord_username: m.profiles.discord_username,
          pro_clubs_name: m.profiles.pro_clubs_name,
          team_name: m.teams.name,
        })) || []
      );

      setTeams(teamsData || []);
      setPlayers(playersData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleApproveFreeAgent = async (playerId: string, approve: boolean) => {
    try {
      const { error } = await supabase
        .from('free_agent_approvals')
        .update({
          status: approve ? 'approved' : 'rejected',
          approved_at: new Date().toISOString(),
        })
        .eq('player_id', playerId);

      if (error) throw error;

      setFreeAgents(prev => prev.filter(fa => fa.id !== playerId));
      toast.success(`Free agent ${approve ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error updating free agent status:', error);
      toast.error('Failed to update free agent status');
    }
  };

  const handleAssignManager = async (playerId: string, teamId: string) => {
    try {
      const { error } = await supabase
        .from('manager_assignments')
        .insert({
          user_id: playerId,
          team_id: teamId,
        });

      if (error) throw error;

      await fetchData(); // Refresh data
      toast.success('Manager assigned successfully');
    } catch (error) {
      console.error('Error assigning manager:', error);
      toast.error('Failed to assign manager');
    }
  };

  const handleRemoveManager = async (managerId: string) => {
    try {
      const { error } = await supabase
        .from('manager_assignments')
        .delete()
        .eq('id', managerId);

      if (error) throw error;

      setManagers(prev => prev.filter(m => m.id !== managerId));
      toast.success('Manager removed successfully');
    } catch (error) {
      console.error('Error removing manager:', error);
      toast.error('Failed to remove manager');
    }
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

  if (!isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-red-600 to-pink-600">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-gray-300 text-lg">
            Manage free agent approvals and team manager assignments
          </p>
        </div>

        <Tabs defaultValue="free-agents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="free-agents" className="data-[state=active]:bg-red-600">
              Free Agent Approvals
            </TabsTrigger>
            <TabsTrigger value="managers" className="data-[state=active]:bg-red-600">
              Manager Assignments
            </TabsTrigger>
          </TabsList>

          {/* Free Agent Approvals */}
          <TabsContent value="free-agents">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Pending Free Agent Approvals ({freeAgents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {freeAgents.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No pending free agent approvals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {freeAgents.map((agent) => (
                      <div 
                        key={agent.id}
                        className="flex items-center justify-between p-4 border border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-purple-600">
                              {agent.pro_clubs_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-white">
                              {agent.pro_clubs_name}
                            </h3>
                            <p className="text-sm text-gray-400">
                              @{agent.discord_username} • {agent.position}
                            </p>
                            <p className="text-xs text-gray-500">
                              Applied: {new Date(agent.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveFreeAgent(agent.id, true)}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApproveFreeAgent(agent.id, false)}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manager Assignments */}
          <TabsContent value="managers" className="space-y-6">
            {/* Current Managers */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Current Managers ({managers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {managers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No managers assigned yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {managers.map((manager) => (
                      <div 
                        key={manager.id}
                        className="flex items-center justify-between p-4 border border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-600">
                              {manager.pro_clubs_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-white">
                              {manager.pro_clubs_name}
                            </h3>
                            <p className="text-sm text-gray-400">
                              @{manager.discord_username}
                            </p>
                            <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30 mt-1">
                              {manager.team_name}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveManager(manager.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assign New Manager */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Assign New Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const playerId = formData.get('player') as string;
                    const teamId = formData.get('team') as string;
                    if (playerId && teamId) {
                      handleAssignManager(playerId, teamId);
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <Select name="player" required>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select Player" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {players.map(player => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.pro_clubs_name} (@{player.discord_username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select name="team" required>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select Team" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Crown className="h-4 w-4 mr-2" />
                    Assign Manager
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}