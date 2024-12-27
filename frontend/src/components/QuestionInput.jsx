import {
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
} from "@chakra-ui/react";

const QuestionInput = ({ question, value, onChange, error }) => {
  const renderInput = () => {
    switch (question.type) {
      case "text":
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case "email":
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case "phone":
        return (
          <Input
            type="tel"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case "select":
        return (
          <Select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Select an option"
          >
            {question.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <FormControl isInvalid={error}>
      <FormLabel>
        {question.question}
        {question.required && <span style={{ color: "red" }}> *</span>}
      </FormLabel>
      {renderInput()}
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default QuestionInput;
