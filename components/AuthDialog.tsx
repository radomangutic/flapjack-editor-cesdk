import {
  Modal,
  Grid,
  Stack,
  Text,
  Flex,
  TextInput,
  Button,
  Box,
} from "@mantine/core";
import Image from "next/image";
import theme from "../config/theme";
import { useRef, useState } from "react";
import { dbClient } from "../tests/helpers/database.helper";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import OtpInput from "react-otp-input";
import { useSetUser, useUser } from "../hooks";

interface IAuthDialogProps {
  opened: boolean;
  onClose: () => void;
}
type ValuePropProps = {
  number: number;
  title: string;
  description: string;
};
interface ILoginErrors {
  email?: string;
  phone?: string;
}

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
  const setUser = useSetUser();
  const [value, setValue] = useState("");
  const [isSendLoginEmail, setIsSendLoginEmail] = useState("");
  const [loginWithEmail, setLoginWithEmail] = useState(true);
  const [otpScreen, setOtpScreen] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<ILoginErrors>({});
  const inventoryTime = 60;
  const [inventoryTimer, setInventoryTimer] = useState<number>(0);

  const inventoryTimerRef = useRef<number | null>(null);

  const handleTimerStart = () => {
    setInventoryTimer(inventoryTime);
    inventoryTimerRef.current = setInterval(() => {
      setInventoryTimer((prevOtpTimer) => prevOtpTimer - 1);
    }, 1000) as unknown as number;

    setTimeout(() => {
      setInventoryTimer(0);
      handleTimerStop();
    }, 1000 * inventoryTime);
  };

  const handleTimerStop = () => {
    clearInterval(inventoryTimerRef.current as number);
    inventoryTimerRef.current = null;
  };

  async function handleLogin() {
    let errorOnSubmit = {};
    if (loginWithEmail) {
      if (!value) {
        errorOnSubmit = { email: "Email required" };
        setError(errorOnSubmit);
        return;
      }
      if (!validateEmail(value)) {
        errorOnSubmit = { email: "Invalid email" };
        setError(errorOnSubmit);
        return;
      }
      setError({});

      const { data, error } = await dbClient.auth.signInWithOtp({
        email: value,
        options: {
          emailRedirectTo: "http://localhost:3000/templates",
        },
      });
      if (error) {
        errorOnSubmit = { email: error.message || "Something went wrong" };
        setError(errorOnSubmit);
        return;
      }
      setIsSendLoginEmail("Please check your email");
    } else {
      if (!value) {
        errorOnSubmit = { phone: "Phone required" };
        setError(errorOnSubmit);
        return;
      }
      if (!isValidPhoneNumber(value)) {
        errorOnSubmit = { phone: "Invalid phone" };
        setError(errorOnSubmit);
        return;
      }
      setError({});
      const { data, error } = await dbClient.auth.signInWithOtp({
        phone: value,
      });
      if (error) {
        errorOnSubmit = { phone: error.message || "Something went wrong" };
        setError(errorOnSubmit);
        return;
      }
      handleTimerStart();
      setOtpScreen(true);
    }
  }
  async function verifyOtp() {
    if (otp.length > 6) {
      setError({phone: "Invalid OTP"})
    }
    const { data, error } = await dbClient.auth.verifyOtp({
      phone: value,
      token: otp,
      type: "sms",
    });

    if (error) {
      setError({ phone: "Invalid Otp" });
    }

    setUser?.(data?.user);
    onClose();
  }

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

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
          sx={{
            borderRadius: "0 8px 8px 0",
            display: "flex",
            flexDirection: "column",
            alignSelf: "center",
          }}
        >
          <Flex
            align="center"
            style={{ cursor: "pointer", margin: "20px auto" }}
          >
            <svg
              width="61"
              height="59"
              viewBox="0 0 31 29"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.3546 28.2073C29.7323 27.928 30.6629 22.203 30.6629 20.8998C30.6629 19.5966 23.823 18.4795 15.3546 18.4795C6.88625 18.4795 0.0463867 19.55 0.0463867 20.8998C0.0463867 22.2496 0.976981 28.4865 15.3546 28.2073Z"
                fill="#FECB80"
              />
              <path
                d="M15.3548 25.7871C23.835 25.7871 30.7096 23.4323 30.7096 20.5276C30.7096 17.6228 23.835 15.2681 15.3548 15.2681C6.87457 15.2681 0 17.6228 0 20.5276C0 23.4323 6.87457 25.7871 15.3548 25.7871Z"
                fill="#EE6D01"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.3546 23.3667C29.7323 23.0874 30.6629 17.3625 30.6629 16.0592C30.6629 14.756 23.823 13.6389 15.3546 13.6389C6.88625 13.6389 0.0463867 14.7094 0.0463867 16.0592C0.0463867 17.3625 0.976981 23.5994 15.3546 23.3667Z"
                fill="#FECB80"
              />
              <path
                d="M15.3548 20.9465C23.835 20.9465 30.7096 18.5918 30.7096 15.687C30.7096 12.7823 23.835 10.4275 15.3548 10.4275C6.87457 10.4275 0 12.7823 0 15.687C0 18.5918 6.87457 20.9465 15.3548 20.9465Z"
                fill="#EE6D01"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.3546 18.4795C29.7323 18.2002 30.6629 12.4753 30.6629 11.172C30.6629 9.86877 23.823 8.75171 15.3546 8.75171C6.88625 8.75171 0.0463867 9.86877 0.0463867 11.172C0.0463867 12.4753 0.976981 18.7588 15.3546 18.4795Z"
                fill="#FECB80"
              />
              <path
                d="M15.3548 16.1523C23.835 16.1523 30.7096 13.7976 30.7096 10.8928C30.7096 7.98807 23.835 5.6333 15.3548 5.6333C6.87457 5.6333 0 7.98807 0 10.8928C0 13.7976 6.87457 16.1523 15.3548 16.1523Z"
                fill="#EE6D01"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.3546 13.6389C29.7323 13.3597 30.6629 7.63469 30.6629 6.33144C30.6629 5.0282 23.823 3.91113 15.3546 3.91113C6.88625 3.91113 0.0463867 4.98165 0.0463867 6.33144C0.0463867 7.68123 0.976981 13.9182 15.3546 13.6389Z"
                fill="#FECB80"
              />
              <path
                d="M15.3548 11.3118C23.835 11.3118 30.7096 8.957 30.7096 6.05224C30.7096 3.14749 23.835 0.792725 15.3548 0.792725C6.87457 0.792725 0 3.14749 0 6.05224C0 8.957 6.87457 11.3118 15.3548 11.3118Z"
                fill="#EE6D01"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.3547 3.25952C20.2403 3.25952 24.335 4.2835 24.9398 5.63329C24.9864 5.72638 25.0329 5.86601 25.0329 6.00564C25.0329 7.30889 22.9391 7.72779 21.7758 8.23978C21.4036 8.42595 21.1244 8.8914 21.0313 9.35684V21.3188C21.0313 22.4358 20.1473 23.3667 19.0306 23.3667H18.984C17.8673 23.3667 16.9367 22.4358 16.9367 21.3188V10.2877C16.7041 8.70522 14.3776 8.0536 13.7262 10.2877V13.8251C13.7262 14.9422 12.8421 15.8731 11.7254 15.8731H11.6789C10.5622 15.8731 9.63158 14.9887 9.63158 13.8717V13.8251V9.40339C9.63158 8.93794 9.39893 8.56559 8.8871 8.19323C7.90998 7.82088 5.63003 7.26234 5.5835 6.00564V5.9591V5.91255C5.72309 4.46968 10.0503 3.25952 15.3547 3.25952Z"
                fill="#BF360B"
              />
            </svg>
            <Text fw={700} ml={8} fz={"xl"}>
              flapjack
            </Text>
          </Flex>
          {loginWithEmail ? (
            <>
              <Box>
                <TextInput
                  label="Email address"
                  placeholder="Enter your email address"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  labelProps={{
                    style: { color: "grey", marginBottom: "10px" },
                  }}
                />
                {isSendLoginEmail && (
                  <Text fz={"sm"} color={"gray"}>
                    {isSendLoginEmail}
                  </Text>
                )}
                {error?.email && (
                  <Text fz={"sm"} color={"red"}>
                    {error?.email}
                  </Text>
                )}
              </Box>
              <Button color="orange" fullWidth onClick={handleLogin} my={10}>
                Log in with Email
              </Button>
              <Button
                color="blue"
                variant="subtle"
                fullWidth
                onClick={() => setLoginWithEmail(false)}
              >
                Log in with Phone
              </Button>
            </>
          ) : otpScreen ? (
            <>
              <Flex justify={"center"} align={"center"} wrap={"wrap"}>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={6}
                  renderSeparator={<span></span>}
                  renderInput={(props) => (
                    <input {...props} className="optInput" />
                  )}
                />
              </Flex>
              <Box>
                {error?.phone && (
                  <Text fz={"sm"} color={"red"}>
                    {error?.phone}
                  </Text>
                )}
              </Box>
              <Button color="orange" fullWidth onClick={verifyOtp} my={10}>
                Verify Otp
              </Button>
              <Button
                disabled={inventoryTimer !== 0}
                color="blue"
                variant="subtle"
                fullWidth
                onClick={handleLogin}
              >
                {`Resend Otp ${inventoryTimer !== 0 ? inventoryTimer : ""}`}
              </Button>
            </>
          ) : (
            <>
              <Box>
                <label
                  className="mantine-InputWrapper-label mantine-TextInput-label mantine-ittua2"
                  style={{ color: "gray", marginBottom: "10px" }}
                >
                  Phone
                </label>
                <PhoneInput
                  placeholder="Enter your phone number"
                  value={value}
                  onChange={(phone: string) => setValue(phone)}
                  className="input-phone"
                />

                {error?.phone && (
                  <Text fz={"sm"} color={"red"}>
                    {error?.phone}
                  </Text>
                )}
              </Box>
              <Button color="orange" fullWidth onClick={handleLogin} my={10}>
                Log in with Phone
              </Button>
              <Button
                color="blue"
                variant="subtle"
                fullWidth
                onClick={() => setLoginWithEmail(true)}
              >
                Log in with Email
              </Button>
            </>
          )}
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
