import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  VStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiFileText } from "react-icons/fi";
import Navbar from "../components/Navbar";

const HomePage = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue("white", "gray.700");
  const user = useSelector((state) => state.auth.user);
  const currentWorkspace = useSelector(
    (state) => state.workspace.currentWorkspace
  );
  const forms = useSelector((state) => state.form.forms) || [];

  // Get recent forms (last 5)
  const recentForms = forms
    .filter((form) => form.workspace === currentWorkspace?._id)
    .slice(0, 5);

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Welcome Section */}
          <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={2}>
              Welcome back, {user?.username}!
            </Text>
            <Text color="gray.600">
              Here's what's happening in your workspace
            </Text>
          </Box>

          {/* Recent Forms */}
          <Box>
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              Recent Forms
            </Text>
            <Grid
              templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
              gap={6}
            >
              {recentForms.length > 0 ? (
                recentForms.map((form) => (
                  <Box
                    key={form._id}
                    bg={bgColor}
                    p={6}
                    borderRadius="lg"
                    shadow="md"
                    cursor="pointer"
                    onClick={() => navigate(`/form/${form._id}`)}
                    _hover={{
                      transform: "translateY(-2px)",
                      transition: "all 0.2s",
                    }}
                  >
                    <VStack spacing={4}>
                      <FiFileText size="2em" />
                      <Text fontSize="lg" fontWeight="bold">
                        {form.name}
                      </Text>
                    </VStack>
                  </Box>
                ))
              ) : (
                <Text color="gray.500">No forms created yet</Text>
              )}
            </Grid>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default HomePage;
