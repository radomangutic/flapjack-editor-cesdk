import { Modal, Grid, Stack, Text, Flex } from "@mantine/core";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Image from "next/image";
import theme from "../config/theme";

interface IAuthDialogProps {
  opened: boolean;
  onClose: () => void;
}
type ValuePropProps = {
  number: number;
  title: string;
  description: string;
};

const ValueProp = ({ number, title, description }: ValuePropProps) => {
  return (
    <Flex>
      <div
        style={{
          border: "solid 2px #C1C2C5",
          borderRadius: "100px",
          width: "30px",
          height: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text color={theme.colors.yellow[9]}>{number}</Text>
      </div>
      <div style={{ marginLeft: "10px" }}>
        <Text color={theme.colors.dark[3]}>{title}</Text>
        <Text fz={theme.fontSizes.xs} color={theme.colors.dark[1]}>
          {description}
        </Text>
      </div>
    </Flex>
  );
};
const SalesContent = () => {
  return (
    <Stack>
      <Image
        src="/upsell-image-small.png"
        width={500}
        height={300}
        alt="this is the alt text"
        placeholder="blur"
        blurDataURL="/upsell-image-blur.jpg"
      />
      <Text align="center" fz="xl" weight={300} color="#343A40">
        Your Menu is Almost Ready to Use
      </Text>
      <Stack>
        <ValueProp
          number={1}
          title="Save Your Work"
          description="Keep your menu up to date"
        />
        <ValueProp
          number={2}
          title="Unlimited downloads"
          description="Get unlimited high-res and watermark-free downloads"
        />
        <ValueProp
          number={3}
          title="Endless Designs"
          description="Unlock access to the most beautiful catalog of menus online"
        />
      </Stack>
    </Stack>
  );
};

const AuthDialog = ({ opened, onClose }: IAuthDialogProps) => {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      radius="md"
      withCloseButton={false}
      padding={8}
      centered={true}
    >
      <Grid>
        <Grid.Col
          span={6}
          bg={theme.colors.gray[1]}
          sx={{ borderRadius: "8px 0 0 8px" }}
          p="xl"
        >
          <SalesContent />
        </Grid.Col>
        <Grid.Col
          span={6}
          bg={"#fff"}
          p="xl"
          sx={{ borderRadius: "0 8px 8px 0" }}
        >
          <Auth
            redirectTo={`${origin}${router.asPath}`}
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "orange",
                    brandAccent: "darkOrange",
                  },
                },
              },
            }}
            providers={["google", "facebook"]}
            magicLink
            view="sign_up"
            localization={{
              variables: {
                sign_up: {
                  social_provider_text: "Sign up with",
                },
              },
            }}
          />
          <Text fz="6pt" ta="center" color={theme.colors.dark[0]} lh="12px">
            By providing us with your information you are consenting to the
            collection and use of vour information in accordance with our{" "}
            <a href="https://www.flapjack.co/terms-of-use">Terms of Service</a>{" "}
            and{" "}
            <a href="https://www.flapjack.co/privacy-policy">Privacy Policy</a>.
          </Text>
        </Grid.Col>
      </Grid>
    </Modal>
  );
};

export default AuthDialog;
