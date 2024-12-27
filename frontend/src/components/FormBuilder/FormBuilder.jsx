import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Container, Spinner, Text } from "@chakra-ui/react";
import { formAPI } from "../../services/api";
import ChatFormBuilder from "./ChatFormBuilder";
import Navbar from "../Navbar";
import { useToast } from "@chakra-ui/react";

const FormBuilder = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const loadForm = async () => {
      try {
        setLoading(true);
        const { data } = await formAPI.getFormById(id);

        // Transform questions from backend format to frontend format
        const transformedQuestions = data.questions.map((q) => ({
          text: q.question || "",
          type: q.type === "button" ? "submit" : q.type,
          required: Boolean(q.required),
          options: q.options,
        }));

        setForm({
          ...data,
          questions: transformedQuestions,
        });
      } catch (error) {
        console.error("Failed to load form:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadForm();
    }
  }, [id]);

  const handleQuestionsChange = (newQuestions) => {
    if (!form) return;

    setForm((prev) => ({
      ...prev,
      questions: newQuestions,
    }));
  };

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

  if (!form) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text>Form not found</Text>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <ChatFormBuilder
          formId={id}
          form={form}
          questions={form.questions || []}
          onQuestionsChange={handleQuestionsChange}
        />
      </Container>
    </Box>
  );
};

export default FormBuilder;
