// src/hooks/useAuth.js

import { useTypedSelector } from ".";

export const useAuth = () => {
  const user = useTypedSelector((state) => state.user.value.user);
  const isLoading = useTypedSelector((state) => state.user.value.context.isLoading);
  const isLoggedIn = useTypedSelector((state) => state.user.value.context.isLoggedIn);
  const userContext = useTypedSelector((state) => state.user.value.context);

  return { user, isLoading, isLoggedIn, userContext };
};


