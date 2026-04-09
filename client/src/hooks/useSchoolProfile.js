import { useQuery } from '@tanstack/react-query';
import { fetchSettings } from '../api/settings.js';

export function useSchoolProfile() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}
