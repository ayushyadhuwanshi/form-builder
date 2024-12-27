import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Avatar,
  IconButton,
  useToast,
  Select,
  FormControl,
  Flex,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

const ChatFormBuilder = ({ questions, onQuestionsChange }) => {
  const [newQuestion, setNewQuestion] = useState("");
  const [questionType, setQuestionType] = useState("text");
  const [options, setOptions] = useState([""]);
  const [isRequired, setIsRequired] = useState(false);
  const toast = useToast();

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) {
      toast({
        title: "Error",
        description: "Question text is required",
        status: "error",
        duration: 2000,
      });
      return;
    }

    const question = {
      type: questionType,
      question: newQuestion,
      required: isRequired,
      options:
        questionType === "select" ? options.filter((opt) => opt.trim()) : [],
    };

    onQuestionsChange([...questions, question]);
    setNewQuestion("");
    setQuestionType("text");
    setOptions([""]);
    setIsRequired(false);
  };

  const handleDeleteQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    onQuestionsChange(newQuestions);
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleDeleteOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  return (
    <Box w="100%" maxW="800px" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Existing Questions */}
        {questions.map((q, index) => (
          <Box
            key={index}
            bg="white"
            p={4}
            borderRadius="lg"
            shadow="sm"
            position="relative"
          >
            <HStack spacing={4} align="flex-start">
              <Avatar size="sm" name="Bot" bg="blue.500" />
              <VStack align="start" flex={1}>
                <Text fontWeight="bold">{q.question}</Text>
                {q.type === "select" && (
                  <VStack align="start" pl={4} spacing={1}>
                    {q.options.map((option, i) => (
                      <Text key={i}>• {option}</Text>
                    ))}
                  </VStack>
                )}
                <Text color="gray.500" fontSize="sm">
                  Type: {q.type} {q.required && "(Required)"}
                </Text>
              </VStack>
              <IconButton
                icon={<DeleteIcon />}
                colorScheme="red"
                size="sm"
                onClick={() => handleDeleteQuestion(index)}
              />
            </HStack>
          </Box>
        ))}

        {/* Add New Question */}
        <Box bg="white" p={4} borderRadius="lg" shadow="sm">
          <VStack spacing={4}>
            <FormControl>
              <Input
                placeholder="Type your question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </FormControl>

            <HStack w="100%">
              <Select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="number">Number</option>
                <option value="select">Multiple Choice</option>
              </Select>

              <Button
                size="sm"
                onClick={() => setIsRequired(!isRequired)}
                variant={isRequired ? "solid" : "outline"}
                colorScheme="blue"
              >
                Required
              </Button>
            </HStack>

            {questionType === "select" && (
              <VStack w="100%" spacing={2}>
                {options.map((option, index) => (
                  <HStack key={index} w="100%">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      onClick={() => handleDeleteOption(index)}
                      size="sm"
                      colorScheme="red"
                    />
                  </HStack>
                ))}
                <Button
                  leftIcon={<AddIcon />}
                  onClick={handleAddOption}
                  size="sm"
                  w="100%"
                >
                  Add Option
                </Button>
              </VStack>
            )}

            <Button colorScheme="blue" onClick={handleAddQuestion} w="100%">
              Add Question
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default ChatFormBuilder;
