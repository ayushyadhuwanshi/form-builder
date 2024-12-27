import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { authAPI } from "../services/api";
import { setCredentials, logout } from "../store/slices/authSlice";

const AuthCheck = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { data } = await authAPI.getProfile();
        dispatch(setCredentials(data));
      } catch (error) {
        dispatch(logout());
      }
    };

    verifyAuth();
  }, [dispatch]);

  return null;
};

export default AuthCheck;
