import { jwtDecode } from "jwt-decode";

export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export const getUserId = () => {
  const user = getCurrentUser();
  return user?.id || null;
};