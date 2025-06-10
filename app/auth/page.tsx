'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, User } from 'lucide-react';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithDiscord } = useAuth();

  const handleDiscordSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithDiscord();
    } catch (error) {
      alert('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Competitive E-Sports League
          </h1>
        </div>

        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Welcome</CardTitle>
            <CardDescription className="text-gray-400">
              Sign in with Discord to join the league.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleDiscordSignIn}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Redirecting...' : 'Sign in with Discord'}
            </Button>
            <div className="text-center p-4 mt-6 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <User className="h-5 w-5 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-blue-300">
                New players are registered as <strong>Free Agents</strong> and require admin approval before being assigned to teams.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}