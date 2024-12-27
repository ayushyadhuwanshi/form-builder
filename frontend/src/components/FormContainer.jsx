import { Box, Container } from "@chakra-ui/react";

const FormContainer = ({ children }) => {
  return (
    <Container maxW="lg" py={12}>
      <Box bg="white" p={8} borderRadius="lg" boxShadow="lg" w="100%">
        {children}
      </Box>
    </Container>
  );
};

export default FormContainer;
