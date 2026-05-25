import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';

export function useLogin() {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async ({ token }) => {
      await login(token);
    },
  });
}
