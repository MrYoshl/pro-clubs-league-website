'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

export default function PlayerProfileClient(props) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Player Profile</h2>
      <p>Name: {profile.name}</p>
      <p>Email: {profile.email}</p>
      {/* ...other profile fields... */}
    </div>
  );
}