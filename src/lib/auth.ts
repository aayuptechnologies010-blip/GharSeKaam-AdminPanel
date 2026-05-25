  // Authentication utilities
import { getAuthToken } from "./constants";

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

export const redirectToAuth = (): void => {
  window.location.href = "/auth";
};

export const logout = (): void => {
  localStorage.removeItem("tempAuthToken");
  localStorage.removeItem("authToken");
  localStorage.removeItem("tempUserName");
  localStorage.removeItem("tempUserEmail");
  localStorage.removeItem("tempUserProfile");
  redirectToAuth();
};

export const getUserData = () => {
  return {
    name: localStorage.getItem("tempUserName") || localStorage.getItem("userName"),
    email: localStorage.getItem("tempUserEmail") || localStorage.getItem("userEmail"),
    profile: localStorage.getItem("tempUserProfile") || localStorage.getItem("userProfile"),
    token: getAuthToken()
  };
};
