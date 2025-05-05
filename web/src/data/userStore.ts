import { User } from "@/types/user";
import { create } from "zustand";
import Cookies from "js-cookie";
import ApiClient from "@/api";
import { ClientKey } from "@/types/clientKey";

interface UserState {
  user: User;
  clientKey: ClientKey;
  setClientKey: (clientKey: ClientKey) => void;
  setUser: (user: User) => void;
  fetchUser: () => void;
  refreshToken: () => void;
  fetchClientKey: () => void;
}

const apiClient = new ApiClient();

export const userStore = create<UserState>((set) => ({
  user: {} as User,
  clientKey: {} as ClientKey,
  setClientKey: (clientKey) => set({ clientKey }),
  setUser: (user) => set({ user }),
  fetchUser: async () => {
    const token = Cookies.get("accessToken");

    if (!token) return;

    return apiClient.session.helper
      .fetchUser(token)
      .then((response) => {
        if (response.status) {
          set({ user: response.data });
        } else {
          set({ user: {} });
        }
      })
      .catch(() => {
        set({ user: {} });
      });
  },
  fetchClientKey: async () => {
    return apiClient.user.helper
      .getClientKey()
      .then((response) => {
        if (response.status) {
          set({ clientKey: response.data });
        } else {
          set({ clientKey: {} });
        }
      })
      .catch(() => {
        set({ clientKey: {} });
      });
  },
  refreshToken: async () => {
    const refreshToken = Cookies.get("refreshToken");

    if (!refreshToken) return;

    return apiClient.session.helper
      .refreshToken(refreshToken)
      .then((response) => {
        if (response.status) {
          Cookies.set("accessToken", response.data.accessToken);
        }
      })
      .catch(() => {
        return { data: null, status: false };
      });
  },
}));
