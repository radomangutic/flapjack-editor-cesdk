import { Button, Flex, Text } from "@mantine/core";
import { useRouter } from "next/router";

interface IPrivatePageProps {
  login?: boolean;
}

const PrivatePage: React.FC<IPrivatePageProps> = ({ login }) => {
  const router = useRouter();
  if (login) {
    return (
      <Flex justify={"center"} align={"center"} h={"calc(100vh - 65px)"}>
        <Text fz={"28px"}>
          Please{" "}
          <Button
            fz={"28px"}
            variant="subtle"
            p={"0"}
            onClick={() => router.push("templates")}
          >
            Login{" "}
          </Button>{" "}
          to continue
        </Text>
      </Flex>
    );
  }
  return (
    <Flex justify={"center"} align={"center"} h={"calc(100vh - 65px)"}>
      <Text fz={"28px"}>You do not have access to this page.</Text>
    </Flex>
  );
};

export default PrivatePage;
