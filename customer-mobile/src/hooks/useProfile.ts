import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';

type Profile = {
  id: string;
  name: string;
  email: string;
};

type UseProfileResult = {
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
};

export function useProfile(userId: string): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiFetch<Profile>(`/users/${userId}`)
      .then((data) => {
        if (!cancelled) {
          setProfile(data);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { profile, loading, error };
}
