import { Box, Button, Container, Heading, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box bg="gray.50" minH="100vh">
      <Container maxW="container.xl" py={20}>
        <Stack spacing={8} alignItems="center" textAlign="center">
          <Heading size="2xl">Create Interactive Forms with Ease</Heading>
          <Text fontSize="xl" color="gray.600">
            Build chat-based forms that engage your users and collect responses
            effectively
          </Text>
          <Stack direction={{ base: "column", md: "row" }} spacing={4}>
            <Button
              colorScheme="blue"
              size="lg"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
            <Button
              colorScheme="green"
              size="lg"
              onClick={() => navigate("/login")}
            >
              Create your form
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default LandingPage;
