import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Heading,
  Divider,
  Text,
} from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import { authAPI } from "../services/api";
import { updateUserProfile, logout } from "../store/slices/authSlice";
import { updateWorkspace } from "../store/slices/workspaceSlice";
import { workspaceAPI } from "../services/api";

const SettingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const user = useSelector((state) => state.auth.user);
  const currentWorkspace = useSelector(
    (state) => state.workspace.currentWorkspace
  );

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileLoading(true);

    try {
      // Update user profile
      const updateData = {
        username,
        email,
        ...(oldPassword && newPassword ? { oldPassword, newPassword } : {}),
      };

      const { data: userData } = await authAPI.updateProfile(updateData);
      dispatch(updateUserProfile(userData));

      // Update workspace name if username changed
      if (username !== user.username && currentWorkspace) {
        const { data: workspaceData } = await workspaceAPI.updateWorkspace(
          currentWorkspace._id,
          {
            name: `${username}'s workspace`,
          }
        );
        dispatch(updateWorkspace(workspaceData));
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
        status: "success",
        duration: 3000,
      });

      // Clear password fields after successful update
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      setProfileError(
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading size="lg">Profile Settings</Heading>

          <form onSubmit={handleUpdateProfile}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Old Password</FormLabel>
                <Input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter to change password"
                />
              </FormControl>

              <FormControl>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </FormControl>

              {profileError && (
                <Text color="red.500" fontSize="sm">
                  {profileError}
                </Text>
              )}

              <Button
                type="submit"
                colorScheme="blue"
                isLoading={profileLoading}
                w="full"
              >
                Save Changes
              </Button>
            </VStack>
          </form>

          <Divider my={8} />

          <Button colorScheme="red" onClick={handleLogout} w="full">
            Logout
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default SettingsPage;
