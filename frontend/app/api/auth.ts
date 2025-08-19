import api from "@/lib/axios";
import { LoginResponse, User } from "@/types/auth";

interface LoginPayload {
  email: string;
  password: string;
}

interface SignupPayload {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>("auth/signin/", payload);
  return res.data;
};

export const signup = async (payload: SignupPayload) => {
  const res = await api.post("auth/signup/", payload);
  return res.data;
};

export const getProfile = async (): Promise<User> => {
  const res = await api.get<User>("auth/profile/");
  return res.data;
};

export const logout = async (refreshToken: string) => {
  try {
    const res = await api.post("auth/logout/", { refresh_token: refreshToken });
    return res.data;
  } catch (error: any) {
    // If logout fails, we still want to clear local state
    console.warn(
      "Logout API call failed:",
      error.response?.data || error.message
    );
    // Return success anyway since we'll clear local state
    return { message: "Logout successful" };
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  const res = await api.post<{ access: string }>("auth/refresh/", {
    refresh_token: refreshToken,
  });
  return res.data;
};
