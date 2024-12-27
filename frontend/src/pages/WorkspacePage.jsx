import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Grid,
  Button,
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
  useToast,
  Flex,
  IconButton,
  Text,
  VStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useColorModeValue,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { FiFileText, FiFolder, FiPlus, FiArrowLeft } from "react-icons/fi";
import Navbar from "../components/Navbar";
import { workspaceAPI } from "../services/api";
import {
  setCurrentWorkspace,
  addFolder,
  removeFolder,
  selectCurrentWorkspace,
  selectFolders,
  loadWorkspaceData,
  setFolders,
} from "../store/slices/workspaceSlice";
import {
  setForms,
  addForm,
  removeForm,
  selectForms,
} from "../store/slices/formSlice";

const WorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.700");

  const [newFolderName, setNewFolderName] = useState("");
  const [newFormName, setNewFormName] = useState("");
  const [currentFolder, setCurrentFolder] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteDialogRef, setDeleteDialogRef] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    isOpen: isFolderModalOpen,
    onOpen: onFolderOpen,
    onClose: onFolderClose,
  } = useDisclosure();

  const {
    isOpen: isFormModalOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteAlertOpen,
    onOpen: onDeleteAlertOpen,
    onClose: onDeleteAlertClose,
  } = useDisclosure();

  const currentWorkspace = useSelector(selectCurrentWorkspace);
  const folders = useSelector(selectFolders);
  const forms = useSelector(selectForms);

  const loadWorkspaceData = async (workspaceId) => {
    if (!workspaceId) {
      console.error("No workspace ID provided");
      return;
    }

    try {
      const { data } = await workspaceAPI.getWorkspaceById(workspaceId);
      dispatch(setCurrentWorkspace(data));
      dispatch(setForms(data.forms || []));
      dispatch(setFolders(data.folders || []));

      // Save to localStorage
      localStorage.setItem(
        "workspaceData",
        JSON.stringify({
          workspace: data,
          forms: data.forms || [],
          folders: data.folders || [],
        })
      );
    } catch (error) {
      console.error("Failed to load workspace data:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to load workspace data",
        status: "error",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    const initializeWorkspace = async () => {
      try {
        setIsLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
          navigate("/login");
          return;
        }

        // Try to get workspace from localStorage first
        const savedWorkspaceData = localStorage.getItem("workspaceData");
        if (savedWorkspaceData) {
          const { workspace, forms, folders } = JSON.parse(savedWorkspaceData);
          dispatch(setCurrentWorkspace(workspace));
          dispatch(setForms(forms));
          dispatch(setFolders(folders));

          // Refresh data from server
          await loadWorkspaceData(workspace._id);
        } else {
          // Create new workspace if none exists
          const { data } = await workspaceAPI.createWorkspace({
            name: `${user.username}'s workspace`,
          });
          dispatch(setCurrentWorkspace(data));
          dispatch(setForms([]));
          dispatch(setFolders([]));

          // Save to localStorage
          localStorage.setItem(
            "workspaceData",
            JSON.stringify({
              workspace: data,
              forms: [],
              folders: [],
            })
          );
        }
      } catch (error) {
        console.error("Workspace initialization error:", error);
        toast({
          title: "Error",
          description: "Failed to initialize workspace",
          status: "error",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeWorkspace();
  }, []);

  // Add effect to update localStorage when workspace data changes
  useEffect(() => {
    if (currentWorkspace) {
      localStorage.setItem(
        "workspaceData",
        JSON.stringify({
          workspace: currentWorkspace,
          forms,
          folders,
        })
      );
    }
  }, [currentWorkspace, forms, folders]);

  // Show loading state
  if (isLoading) {
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

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!currentWorkspace?._id) return;

    // Check if folder name already exists
    if (
      folders.some((f) => f.name.toLowerCase() === newFolderName.toLowerCase())
    ) {
      toast({
        title: "Error",
        description: "A folder with this name already exists",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      const { data } = await workspaceAPI.createFolder(currentWorkspace._id, {
        name: newFolderName,
      });
      dispatch(addFolder(data));
      onFolderClose();
      setNewFolderName("");
      await loadWorkspaceData();

      toast({
        title: "Success",
        description: "Folder created successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create folder",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleCreateForm = async (e) => {
    e.preventDefault();
    if (!currentWorkspace?._id) return;

    // Check if form name already exists in the current context
    const existingForms = currentFolder
      ? forms.filter((f) => f.folder === currentFolder._id)
      : forms.filter((f) => !f.folder);

    if (
      existingForms.some(
        (f) => f.name.toLowerCase() === newFormName.toLowerCase()
      )
    ) {
      toast({
        title: "Error",
        description: "A form with this name already exists in this location",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      const { data } = await workspaceAPI.createForm(currentWorkspace._id, {
        name: newFormName,
        folder: currentFolder?._id || null,
      });

      dispatch(addForm(data));
      onFormClose();
      setNewFormName("");

      // Reload workspace data to ensure everything is in sync
      await loadWorkspaceData(currentWorkspace._id);

      toast({
        title: "Success",
        description: "Form created successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create form",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete || !currentWorkspace?._id) return;

    try {
      if (itemToDelete.type === "folder") {
        await workspaceAPI.deleteFolder(currentWorkspace._id, itemToDelete.id);
        dispatch(removeFolder(itemToDelete.id));
      } else {
        await workspaceAPI.deleteForm(currentWorkspace._id, itemToDelete.id);
        dispatch(removeForm(itemToDelete.id));
      }
      toast({
        title: "Success",
        description: `${itemToDelete.type} deleted successfully`,
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          `Failed to delete ${itemToDelete.type}`,
        status: "error",
        duration: 3000,
      });
    } finally {
      onDeleteAlertClose();
      setItemToDelete(null);
    }
  };

  const handleBackToRoot = () => {
    setCurrentFolder(null);
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar currentWorkspace={currentWorkspace} />

      {/* Header - Folder Creation and Navigation */}
      <Box py={4} px={8} borderBottomWidth="1px">
        <HStack spacing={4}>
          {currentFolder ? (
            <>
              <Button
                leftIcon={<FiArrowLeft />}
                onClick={handleBackToRoot}
                variant="ghost"
              >
                Back to Workspace
              </Button>
              <Text fontSize="lg" fontWeight="bold">
                {currentFolder.name}
              </Text>
            </>
          ) : (
            <Button
              leftIcon={<FiFolder />}
              onClick={onFolderOpen}
              colorScheme="blue"
              variant="outline"
            >
              Create Folder
            </Button>
          )}
        </HStack>
      </Box>

      {/* Body */}
      <Container maxW="container.xl" py={8}>
        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
          {!currentFolder ? (
            // Show folders and typebots at root level
            <>
              {/* Create Typebot Box */}
              <Box
                bg={bgColor}
                p={6}
                borderRadius="lg"
                shadow="md"
                cursor="pointer"
                onClick={onFormOpen}
                _hover={{
                  transform: "translateY(-2px)",
                  transition: "all 0.2s",
                }}
              >
                <VStack spacing={4}>
                  <Box
                    w="40px"
                    h="40px"
                    borderRadius="full"
                    bg="blue.50"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FiPlus size="24px" color="blue" />
                  </Box>
                  <Text fontSize="lg" fontWeight="medium">
                    Create a typebot
                  </Text>
                </VStack>
              </Box>

              {/* Folders */}
              {folders.map((folder) => (
                <Box
                  key={folder._id}
                  bg={bgColor}
                  p={6}
                  borderRadius="lg"
                  shadow="md"
                  position="relative"
                  cursor="pointer"
                  onClick={() => setCurrentFolder(folder)}
                  _hover={{
                    transform: "translateY(-2px)",
                    transition: "all 0.2s",
                  }}
                >
                  <IconButton
                    position="absolute"
                    top={2}
                    right={2}
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete({ type: "folder", id: folder._id });
                      onDeleteAlertOpen();
                    }}
                  />
                  <VStack spacing={4}>
                    <FiFolder size="24px" />
                    <Text fontSize="lg" fontWeight="bold">
                      {folder.name}
                    </Text>
                  </VStack>
                </Box>
              ))}

              {/* Root level forms - only show forms without a folder */}
              {forms
                .filter((form) => form.folder === null)
                .map((form) => (
                  <Box
                    key={form._id}
                    bg={bgColor}
                    p={6}
                    borderRadius="lg"
                    shadow="md"
                    position="relative"
                    _hover={{
                      transform: "translateY(-2px)",
                      transition: "all 0.2s",
                    }}
                  >
                    <IconButton
                      position="absolute"
                      top={2}
                      right={2}
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete({ type: "form", id: form._id });
                        onDeleteAlertOpen();
                      }}
                    />
                    <VStack
                      spacing={4}
                      cursor="pointer"
                      onClick={() => navigate(`/form/${form._id}`)}
                    >
                      <FiFileText size="2em" />
                      <Text fontSize="lg" fontWeight="bold">
                        {form.name}
                      </Text>
                    </VStack>
                  </Box>
                ))}
            </>
          ) : (
            // Show forms inside the current folder
            <>
              {/* Create Typebot Box - Inside Folder */}
              <Box
                bg={bgColor}
                p={6}
                borderRadius="lg"
                shadow="md"
                cursor="pointer"
                onClick={onFormOpen}
                _hover={{
                  transform: "translateY(-2px)",
                  transition: "all 0.2s",
                }}
              >
                <VStack spacing={4}>
                  <Box
                    w="40px"
                    h="40px"
                    borderRadius="full"
                    bg="blue.50"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FiPlus size="24px" color="blue" />
                  </Box>
                  <Text fontSize="lg" fontWeight="medium">
                    Create a typebot
                  </Text>
                </VStack>
              </Box>

              {/* Forms in current folder - only show forms belonging to this folder */}
              {forms
                .filter((form) => form.folder === currentFolder._id)
                .map((form) => (
                  <Box
                    key={form._id}
                    bg={bgColor}
                    p={6}
                    borderRadius="lg"
                    shadow="md"
                    position="relative"
                    _hover={{
                      transform: "translateY(-2px)",
                      transition: "all 0.2s",
                    }}
                  >
                    <IconButton
                      position="absolute"
                      top={2}
                      right={2}
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete({ type: "form", id: form._id });
                        onDeleteAlertOpen();
                      }}
                    />
                    <VStack
                      spacing={4}
                      cursor="pointer"
                      onClick={() => navigate(`/form/${form._id}`)}
                    >
                      <FiFileText size="2em" />
                      <Text fontSize="lg" fontWeight="bold">
                        {form.name}
                      </Text>
                    </VStack>
                  </Box>
                ))}
            </>
          )}
        </Grid>
      </Container>

      {/* Create Folder Modal */}
      <Modal isOpen={isFolderModalOpen} onClose={onFolderClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Folder</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleCreateFolder}>
              <FormControl>
                <FormLabel>Folder Name</FormLabel>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                />
              </FormControl>
              <Button mt={4} colorScheme="blue" type="submit" w="full">
                Create
              </Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Create Form Modal */}
      <Modal isOpen={isFormModalOpen} onClose={onFormClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Form</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleCreateForm}>
              <FormControl>
                <FormLabel>Form Name</FormLabel>
                <Input
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                  placeholder="Enter form name"
                />
              </FormControl>
              <Button mt={4} colorScheme="blue" type="submit" w="full">
                Create
              </Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={deleteDialogRef}
        onClose={onDeleteAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete {itemToDelete?.type}
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={deleteDialogRef} onClick={onDeleteAlertClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default WorkspacePage;
