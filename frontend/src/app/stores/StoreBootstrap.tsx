import { useEffect } from "react";
import { useSessionStore } from "./sessionStore";
import { useUserStore } from "./userStore";

export function StoreBootstrap() {
  const hydrate = useSessionStore((s) => s.hydrate);
  const token = useSessionStore((s) => s.token);
  const refreshUser = useSessionStore((s) => s.refreshUser);
  const clearInvalidSession = useSessionStore((s) => s.clearInvalidSession);
  const initUserEffects = useUserStore((s) => s.initUserEffects);

  useEffect(() => {
    hydrate();
    return initUserEffects();
  }, [hydrate, initUserEffects]);

  useEffect(() => {
    if (!token) {
      useSessionStore.setState({ user: null, isAuthenticated: false });
      return;
    }
    void refreshUser().catch(() => clearInvalidSession());
  }, [token, refreshUser, clearInvalidSession]);

  return null;
}
