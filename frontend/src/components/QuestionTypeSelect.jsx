import { Select } from "@chakra-ui/react";

const QuestionTypeSelect = ({ value, onChange }) => {
  return (
    <Select value={value} onChange={onChange}>
      <option value="text">Text</option>
      <option value="email">Email</option>
      <option value="phone">Phone</option>
      <option value="number">Number</option>
      <option value="select">Multiple Choice</option>
    </Select>
  );
};

export default QuestionTypeSelect;
