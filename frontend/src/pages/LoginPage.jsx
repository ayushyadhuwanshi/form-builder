import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Link,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import FormContainer from "../components/FormContainer";
import { authAPI } from "../services/api";
import {
  setCredentials,
  setError,
  setLoading,
} from "../store/slices/authSlice";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { loading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(setLoading(true));
      const { data } = await authAPI.login({ email, password });
      dispatch(setCredentials(data));
      navigate("/home");
      toast({
        title: "Login successful",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      dispatch(setError(error.response?.data?.message || "Login failed"));
      toast({
        title: "Error",
        description: error.response?.data?.message || "Login failed",
        status: "error",
        duration: 3000,
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <FormContainer>
      <Stack spacing={4} as="form" onSubmit={handleSubmit}>
        <FormControl id="email" isRequired>
          <FormLabel>Email address</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl id="password" isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputRightElement>
              <IconButton
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowPassword(!showPassword)}
                variant="ghost"
                aria-label={showPassword ? "Hide password" : "Show password"}
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          fontSize="md"
          isLoading={loading}
        >
          Sign in
        </Button>

        <Text textAlign="center">
          Don't have an account?{" "}
          <Link as={RouterLink} to="/register" color="blue.500">
            Register
          </Link>
        </Text>
      </Stack>
    </FormContainer>
  );
};

export default LoginPage;
