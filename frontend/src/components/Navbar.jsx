import {
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import { ChevronDownIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { FiShare2 } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import {
  selectWorkspaces,
  selectCurrentWorkspace,
} from "../store/slices/workspaceSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { colorMode, toggleColorMode } = useColorMode();

  const user = useSelector((state) => state.auth.user);
  const workspaces = useSelector(selectWorkspaces) || [];
  const currentWorkspace = useSelector(selectCurrentWorkspace);

  // Only get shared workspaces (workspaces not owned by current user)
  const sharedWorkspaces =
    workspaces.filter((workspace) => workspace.owner !== user?._id) || [];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Box px={4} py={2} borderBottomWidth="1px">
      <Flex alignItems="center" justifyContent="space-between">
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {currentWorkspace?.name || "Select Workspace"}
          </MenuButton>
          <MenuList>
            {/* User's workspace */}
            {user?.workspace && (
              <MenuItem
                onClick={() => navigate(`/workspace/${user.workspace}`)}
              >
                {`${user.username}'s workspace`}
              </MenuItem>
            )}

            {/* Shared workspaces */}
            {sharedWorkspaces.length > 0 && (
              <>
                <MenuDivider />
                {sharedWorkspaces.map((workspace) => (
                  <MenuItem
                    key={workspace._id}
                    onClick={() => navigate(`/workspace/${workspace._id}`)}
                  >
                    {workspace.name}
                  </MenuItem>
                ))}
              </>
            )}

            <MenuDivider />
            <MenuItem onClick={() => navigate("/settings")}>Settings</MenuItem>
            <MenuItem onClick={handleLogout}>Log out</MenuItem>
          </MenuList>
        </Menu>

        <Flex gap={2}>
          <IconButton icon={<FiShare2 />} aria-label="Share" variant="ghost" />
          <IconButton
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            aria-label="Toggle color mode"
            variant="ghost"
          />
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
