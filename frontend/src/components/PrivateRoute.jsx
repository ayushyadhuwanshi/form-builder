import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Spinner, Center } from "@chakra-ui/react";

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
