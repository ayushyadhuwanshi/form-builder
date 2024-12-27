import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  VStack,
  Button,
  Heading,
  useToast,
  HStack,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Switch,
} from "@chakra-ui/react";
import { FiShare2, FiSettings } from "react-icons/fi";
import Navbar from "../components/Navbar";
import ChatFormBuilder from "../components/FormBuilder/ChatFormBuilder";
import { formAPI } from "../services/api";
import { setCurrentForm, updateForm } from "../store/slices/formSlice";

const FormBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const [formName, setFormName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentForm = useSelector((state) => state.form.currentForm);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const { data } = await formAPI.getFormById(id);
        dispatch(setCurrentForm(data));
        setFormName(data.name);
        setQuestions(data.questions || []);
        setIsPublic(data.isPublic || false);
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to fetch form",
          status: "error",
          duration: 3000,
        });
        navigate("/home");
      }
    };

    fetchForm();
  }, [id, dispatch, navigate, toast]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data } = await formAPI.updateForm(id, {
        name: formName,
        questions,
        isPublic,
      });
      dispatch(updateForm(data));
      toast({
        title: "Success",
        description: "Form saved successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save form",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const { data } = await formAPI.createShareLink(id);
      setShareLink(data.shareLink);
      onOpen();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create share link",
        status: "error",
        duration: 3000,
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Success",
      description: "Link copied to clipboard",
      status: "success",
      duration: 2000,
    });
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between">
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Form Name"
              size="lg"
              fontWeight="bold"
              variant="flushed"
              maxW="400px"
            />
            <HStack>
              <IconButton
                icon={<FiShare2 />}
                onClick={handleShare}
                aria-label="Share form"
              />
              <IconButton
                icon={<FiSettings />}
                onClick={onOpen}
                aria-label="Form settings"
              />
              <Button
                colorScheme="blue"
                onClick={handleSave}
                isLoading={loading}
              >
                Save Changes
              </Button>
            </HStack>
          </HStack>

          <ChatFormBuilder
            questions={questions}
            onQuestionsChange={setQuestions}
          />
        </VStack>

        {/* Settings Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Form Settings</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Make form public</FormLabel>
                  <Switch
                    isChecked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                </FormControl>

                {shareLink && (
                  <FormControl>
                    <FormLabel>Share Link</FormLabel>
                    <HStack>
                      <Input value={shareLink} isReadOnly />
                      <Button onClick={copyToClipboard}>Copy</Button>
                    </HStack>
                  </FormControl>
                )}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default FormBuilder;
