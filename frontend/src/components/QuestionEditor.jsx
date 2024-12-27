import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Switch,
  IconButton,
  VStack,
  HStack,
  Button,
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import QuestionTypeSelect from "./QuestionTypeSelect";

const QuestionEditor = ({ question, onUpdate, onDelete, index }) => {
  const handleOptionAdd = () => {
    const newOptions = [...question.options, ""];
    onUpdate({ ...question, options: newOptions });
  };

  const handleOptionChange = (optionIndex, value) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    onUpdate({ ...question, options: newOptions });
  };

  const handleOptionDelete = (optionIndex) => {
    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    onUpdate({ ...question, options: newOptions });
  };

  return (
    <Box p={4} borderWidth={1} borderRadius="md" position="relative">
      <IconButton
        icon={<DeleteIcon />}
        position="absolute"
        top={2}
        right={2}
        colorScheme="red"
        size="sm"
        onClick={() => onDelete(index)}
      />
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Question Type</FormLabel>
          <QuestionTypeSelect
            value={question.type}
            onChange={(e) => onUpdate({ ...question, type: e.target.value })}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Question Text</FormLabel>
          <Input
            value={question.question}
            onChange={(e) =>
              onUpdate({ ...question, question: e.target.value })
            }
          />
        </FormControl>

        {question.type === "select" && (
          <Box>
            <FormLabel>Options</FormLabel>
            <VStack spacing={2} align="stretch">
              {question.options.map((option, optionIndex) => (
                <HStack key={optionIndex}>
                  <Input
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(optionIndex, e.target.value)
                    }
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => handleOptionDelete(optionIndex)}
                    colorScheme="red"
                    size="sm"
                  />
                </HStack>
              ))}
              <Button
                leftIcon={<AddIcon />}
                onClick={handleOptionAdd}
                size="sm"
                variant="outline"
              >
                Add Option
              </Button>
            </VStack>
          </Box>
        )}

        <FormControl display="flex" alignItems="center">
          <FormLabel mb={0}>Required</FormLabel>
          <Switch
            isChecked={question.required}
            onChange={(e) =>
              onUpdate({ ...question, required: e.target.checked })
            }
          />
        </FormControl>
      </VStack>
    </Box>
  );
};

export default QuestionEditor;
