import { useState, useEffect } from "react";
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
  FormLabel,
  Flex,
  useColorModeValue,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  Switch,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, SettingsIcon } from "@chakra-ui/icons";
import {
  FiMessageSquare,
  FiMail,
  FiPhone,
  FiHash,
  FiList,
  FiAlignLeft,
  FiCalendar,
  FiSend,
} from "react-icons/fi";
import { formAPI } from "../../services/api";

const QUESTION_TYPES = {
  text: "Short Text",
  email: "Email",
  phone: "Phone Number",
  number: "Number",
  select: "Multiple Choice",
  longText: "Long Text",
  date: "Date",
  submit: "Submit Button",
};

// Add a mapping for backend to frontend types
const BACKEND_TO_FRONTEND_TYPES = {
  button: "submit",
  text: "text",
  email: "email",
  phone: "phone",
  number: "number",
  select: "select",
  longText: "longText",
  date: "date",
};

const ChatFormBuilder = ({ formId, form, questions, onQuestionsChange }) => {
  // 1. All context hooks
  const { colorMode } = useColorMode();
  const toast = useToast();

  // 2. All color mode values
  const bgColor = useColorModeValue("white", "gray.700");
  const botBgColor = useColorModeValue("blue.50", "blue.900");
  const userBgColor = useColorModeValue("green.50", "green.900");
  const inputBgColor = useColorModeValue("gray.100", "gray.600");

  // 3. All state hooks
  const [newQuestion, setNewQuestion] = useState("");
  const [questionType, setQuestionType] = useState("text");
  const [options, setOptions] = useState([""]);
  const [isRequired, setIsRequired] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

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
      text: newQuestion,
      type: questionType,
      required: isRequired && questionType !== "submit",
      options:
        questionType === "select" ? options.filter((opt) => opt.trim()) : [],
    };

    if (editingIndex >= 0) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = question;
      onQuestionsChange(updatedQuestions);
      setEditingIndex(-1);
    } else {
      onQuestionsChange([...questions, question]);
    }

    setNewQuestion("");
    setQuestionType("text");
    setOptions([""]);
    setIsRequired(false);
  };

  const handleEditQuestion = (index) => {
    const question = questions[index];
    setNewQuestion(question.text);
    setQuestionType(question.type);
    setIsRequired(question.required);
    setOptions(question.options?.length ? question.options : [""]);
    setEditingIndex(index);
  };

  const handleDeleteQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    onQuestionsChange(newQuestions);
    if (editingIndex === index) {
      setEditingIndex(-1);
      setNewQuestion("");
      setQuestionType("text");
      setOptions([""]);
      setIsRequired(false);
    }
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

  const renderQuestionInput = () => {
    switch (questionType) {
      case "submit":
        return (
          <Button isDisabled colorScheme="blue" width="100%">
            {newQuestion || "Submit"}
          </Button>
        );
      case "select":
        return (
          <VStack align="stretch" spacing={2}>
            {options.map((option, index) => (
              <HStack key={index}>
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  onClick={() => handleDeleteOption(index)}
                  colorScheme="red"
                  size="sm"
                />
              </HStack>
            ))}
            <Button
              leftIcon={<AddIcon />}
              onClick={handleAddOption}
              size="sm"
              variant="outline"
            >
              Add Option
            </Button>
          </VStack>
        );
      default:
        return (
          <Input
            placeholder="Type your response..."
            isDisabled
            bg={inputBgColor}
          />
        );
    }
  };

  const handleSave = async () => {
    if (!formId || !form) {
      toast({
        title: "Error",
        description: "Missing required form data",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      const formData = {
        _id: formId,
        name: form.name,
        questions: questions.map((q) => ({
          question: q.text || "",
          type: q.type === "submit" ? "button" : q.type || "text",
          required: Boolean(q.required),
          options: q.type === "select" ? q.options || [] : undefined,
        })),
        workspace: form.workspace,
        folder: form.folder,
        isPublic: Boolean(form.isPublic),
      };

      const { data } = await formAPI.updateForm(formId, formData);

      if (data) {
        const transformedQuestions = data.questions.map((q) => ({
          text: q.question || "",
          type: q.type === "button" ? "submit" : q.type,
          required: Boolean(q.required),
          options: q.options,
        }));

        onQuestionsChange(transformedQuestions);
        toast({
          title: "Success",
          description: "Form updated successfully",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Form update error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update form",
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Flex w="100%" gap={6}>
      {/* Left Panel - Question Types */}
      <Box
        w="300px"
        bg={bgColor}
        p={6}
        borderRadius="lg"
        shadow="md"
        h="fit-content"
      >
        <VStack spacing={4} align="stretch">
          <Text fontSize="xl" fontWeight="bold" mb={2}>
            Question Types
          </Text>

          {/* Question Type Buttons */}
          {Object.entries(QUESTION_TYPES).map(([type, label]) => (
            <Button
              key={type}
              onClick={() => {
                setQuestionType(type);
                setNewQuestion(type === "submit" ? "Submit" : "");
              }}
              colorScheme={questionType === type ? "blue" : "gray"}
              variant={questionType === type ? "solid" : "outline"}
              leftIcon={getQuestionTypeIcon(type)}
              justifyContent="flex-start"
              h="auto"
              py={3}
            >
              <VStack align="start" spacing={0}>
                <Text>{label}</Text>
                <Text fontSize="xs" color="gray.500">
                  {getQuestionTypeDescription(type)}
                </Text>
              </VStack>
            </Button>
          ))}
        </VStack>
      </Box>

      {/* Right Panel - Form Builder */}
      <Box flex={1}>
        <VStack spacing={6} align="stretch">
          {/* Question List */}
          <Box bg={bgColor} p={6} borderRadius="lg" shadow="md">
            <Text fontSize="xl" fontWeight="bold" mb={6}>
              Form Preview
            </Text>
            {questions.map((q, index) => (
              <Box key={index} mb={6}>
                {/* Bot Message */}
                <HStack
                  bg={botBgColor}
                  p={4}
                  borderRadius="lg"
                  maxW="80%"
                  mb={4}
                >
                  <Avatar size="sm" name="Bot" bg="blue.500" />
                  <VStack align="start" flex={1}>
                    <Text fontWeight="bold">{q.text}</Text>
                    {q.required && q.type !== "submit" && (
                      <Text fontSize="sm" color="red.500">
                        *Required
                      </Text>
                    )}
                  </VStack>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<SettingsIcon />}
                      variant="ghost"
                      size="sm"
                    />
                    <MenuList>
                      <MenuItem onClick={() => handleEditQuestion(index)}>
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleDeleteQuestion(index)}
                        color="red.500"
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>

                {/* User Input Preview */}
                <Flex justify="flex-end" mb={4}>
                  <Box bg={userBgColor} p={4} borderRadius="lg" maxW="80%">
                    {q.type === "submit" ? (
                      <Button colorScheme="blue" width="100%">
                        {q.text || "Submit"}
                      </Button>
                    ) : q.type === "select" ? (
                      <VStack align="start" spacing={1}>
                        {q.options.map((option, i) => (
                          <Text key={i}>• {option}</Text>
                        ))}
                      </VStack>
                    ) : (
                      <Input
                        placeholder={`Sample ${QUESTION_TYPES[q.type]} input`}
                        isDisabled
                        bg={inputBgColor}
                      />
                    )}
                  </Box>
                </Flex>
              </Box>
            ))}
          </Box>

          {/* Question Editor */}
          {questionType && (
            <Box bg={bgColor} p={6} borderRadius="lg" shadow="md">
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Question Text</FormLabel>
                  <Input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Type your question..."
                  />
                </FormControl>

                {questionType === "select" && (
                  <FormControl>
                    <FormLabel>Options</FormLabel>
                    {renderQuestionInput()}
                  </FormControl>
                )}

                {questionType !== "submit" && (
                  <FormControl>
                    <Flex align="center">
                      <FormLabel mb={0}>Required</FormLabel>
                      <Switch
                        isChecked={isRequired}
                        onChange={(e) => setIsRequired(e.target.checked)}
                      />
                    </Flex>
                  </FormControl>
                )}

                <Button
                  colorScheme="blue"
                  onClick={handleAddQuestion}
                  leftIcon={<AddIcon />}
                >
                  {editingIndex >= 0 ? "Update Question" : "Add Question"}
                </Button>
              </VStack>
            </Box>
          )}

          {/* Save Button */}
          <Button
            colorScheme="green"
            size="lg"
            onClick={handleSave}
            isDisabled={questions.length === 0}
          >
            Save Form
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

// Add these helper functions at the top of the file
const getQuestionTypeIcon = (type) => {
  switch (type) {
    case "text":
      return <FiMessageSquare />;
    case "email":
      return <FiMail />;
    case "phone":
      return <FiPhone />;
    case "number":
      return <FiHash />;
    case "select":
      return <FiList />;
    case "longText":
      return <FiAlignLeft />;
    case "date":
      return <FiCalendar />;
    case "submit":
      return <FiSend />;
    default:
      return <FiMessageSquare />;
  }
};

const getQuestionTypeDescription = (type) => {
  switch (type) {
    case "text":
      return "Short text response";
    case "email":
      return "Email address input";
    case "phone":
      return "Phone number input";
    case "number":
      return "Numeric input";
    case "select":
      return "Multiple choice options";
    case "longText":
      return "Long text response";
    case "date":
      return "Date picker";
    case "submit":
      return "Form submit button";
    default:
      return "";
  }
};

export default ChatFormBuilder;
