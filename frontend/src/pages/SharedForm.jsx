import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Avatar,
  HStack,
  Alert,
  AlertIcon,
  Spinner,
} from "@chakra-ui/react";
import { formAPI } from "../services/api";

const SharedForm = () => {
  const { shareId } = useParams();
  const toast = useToast();

  const [form, setForm] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const { data } = await formAPI.getSharedForm(shareId);
        setForm(data);
        if (data.questions && data.questions.length > 0) {
          setAnswers(new Array(data.questions.length).fill(""));
        }
      } catch (error) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Form not found or expired",
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [shareId, toast]);

  if (loading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!form || !form.questions || form.questions.length === 0) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error">
          <AlertIcon />
          Form not found or has no questions
        </Alert>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="success">
          <AlertIcon />
          Thank you for your response!
        </Alert>
      </Container>
    );
  }

  const currentQuestion = form.questions[currentQuestionIndex];

  const validateAnswer = (question, answer) => {
    if (!question) return null;

    if (question.required && !answer.trim()) {
      return "This field is required";
    }

    switch (question.type) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(answer)) {
          return "Please enter a valid email address";
        }
        break;
      case "phone":
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(answer)) {
          return "Please enter a valid phone number";
        }
        break;
      case "number":
        if (isNaN(answer)) {
          return "Please enter a valid number";
        }
        break;
      default:
        break;
    }
    return null;
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    const error = validateAnswer(
      currentQuestion,
      answers[currentQuestionIndex]
    );
    if (error) {
      setErrors({ ...errors, [currentQuestionIndex]: error });
      return;
    }

    setErrors({ ...errors, [currentQuestionIndex]: null });
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleSubmit = async () => {
    if (!currentQuestion) return;

    const error = validateAnswer(
      currentQuestion,
      answers[currentQuestionIndex]
    );
    if (error) {
      setErrors({ ...errors, [currentQuestionIndex]: error });
      return;
    }

    setSubmitting(true);
    try {
      await formAPI.submitResponse(shareId, {
        answers: form.questions.map((q, i) => ({
          question: q.text,
          answer: answers[i],
        })),
      });
      setSubmitted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit form",
        status: "error",
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">{form.name}</Heading>

        <Box p={6} borderRadius="lg" borderWidth={1}>
          <VStack spacing={6} align="stretch">
            <HStack>
              <Avatar size="sm" name="Bot" bg="blue.500" />
              <Text fontWeight="bold">
                Question {currentQuestionIndex + 1} of {form.questions.length}
              </Text>
            </HStack>

            <Box>
              <Text fontSize="lg">
                {currentQuestion.text}
                {currentQuestion.required && (
                  <Text as="span" color="red.500">
                    *
                  </Text>
                )}
              </Text>

              <FormControl isInvalid={errors[currentQuestionIndex]} mt={4}>
                {currentQuestion.type === "select" ? (
                  <Select
                    value={answers[currentQuestionIndex]}
                    onChange={(e) => {
                      const newAnswers = [...answers];
                      newAnswers[currentQuestionIndex] = e.target.value;
                      setAnswers(newAnswers);
                    }}
                  >
                    <option value="">Select an option</option>
                    {currentQuestion.options?.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    type={currentQuestion.type}
                    value={answers[currentQuestionIndex]}
                    onChange={(e) => {
                      const newAnswers = [...answers];
                      newAnswers[currentQuestionIndex] = e.target.value;
                      setAnswers(newAnswers);
                    }}
                  />
                )}
                <FormErrorMessage>
                  {errors[currentQuestionIndex]}
                </FormErrorMessage>
              </FormControl>

              <Button
                mt={4}
                colorScheme="blue"
                onClick={
                  currentQuestionIndex === form.questions.length - 1
                    ? handleSubmit
                    : handleNext
                }
                isLoading={submitting}
              >
                {currentQuestionIndex === form.questions.length - 1
                  ? "Submit"
                  : "Next"}
              </Button>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default SharedForm;
