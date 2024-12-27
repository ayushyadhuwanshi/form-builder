import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useToast,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FiDownload } from "react-icons/fi";
import Navbar from "../components/Navbar";
import { formAPI } from "../services/api";

const FormResponses = () => {
  const { id } = useParams();
  const toast = useToast();

  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const [formData, responsesData] = await Promise.all([
          formAPI.getFormById(id),
          formAPI.getFormResponses(id),
        ]);
        setForm(formData.data);
        setResponses(responsesData.data);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to fetch responses",
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [id, toast]);

  const exportToCSV = () => {
    if (!form || !responses.length) return;

    const headers = ["Timestamp", ...form.questions.map((q) => q.text)];
    const rows = responses.map((response) => {
      return [
        new Date(response.createdAt).toLocaleString(),
        ...form.questions.map((q) => {
          const answer = response.answers.find((a) => a.question === q.text);
          return answer ? answer.answer : "";
        }),
      ];
    });

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.name}_responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return null;

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between">
            <Heading size="lg">{form?.name} Responses</Heading>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                Export
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiDownload />} onClick={exportToCSV}>
                  Download CSV
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>

          {responses.length > 0 ? (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Timestamp</Th>
                    {form.questions.map((q, i) => (
                      <Th key={i}>{q.text}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {responses.map((response, i) => (
                    <Tr key={i}>
                      <Td>{new Date(response.createdAt).toLocaleString()}</Td>
                      {form.questions.map((q, j) => {
                        const answer = response.answers.find(
                          (a) => a.question === q.text
                        );
                        return <Td key={j}>{answer?.answer || "-"}</Td>;
                      })}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Text textAlign="center" color="gray.500">
              No responses yet
            </Text>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default FormResponses;
