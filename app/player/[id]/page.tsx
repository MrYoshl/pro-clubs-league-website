import PlayerProfileClient from './PlayerProfileClient';

export default function PlayerProfilePage(props) {
  // Optionally fetch data server-side and pass as props
  return <PlayerProfileClient {...props} />;
}

import { createClient } from '@supabase/supabase-js';

export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('profiles')
    .select('id');

  if (error || !data) return [];

  return data
    .filter((row: { id: string }) => !!row.id && row.id !== 'undefined')
    .map((row: { id: string }) => ({ id: row.id }));
}