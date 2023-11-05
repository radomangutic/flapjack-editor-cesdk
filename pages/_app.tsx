import { useState, useEffect } from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider, AppShell } from "@mantine/core";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import theme from "../config/theme";
import Header from "../components/Header";
import "../styles/globals.css";
import { NotificationsProvider } from "@mantine/notifications";
import { hotjar } from "react-hotjar";
import { GoogleAnalytics } from "nextjs-google-analytics";
import UserContextProvider from "../context/UserContext";
import { IntercomProvider } from "react-use-intercom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function App({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session;
}>) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  const [initialed, setInitial] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setInitial(true);
    hotjar.initialize(3291123, 6);
  }, []);

  if (initialed) {
    return (
      <>
        <Head>
          <title>Flapjack</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
        </Head>
        <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
          <NotificationsProvider>
            <SessionContextProvider
              supabaseClient={supabaseClient}
              initialSession={pageProps.initialSession}
            >
              <UserContextProvider>
                <AppShell
                  padding={0}
                  header={
                    !router.pathname.includes("preview") && !router.pathname.includes("tv/") ? <Header /> : <></>
                  }
                  styles={(theme) => ({
                    main: {
                      backgroundColor: !router.pathname.includes("templates") ? "#e7ebee" : 'inherit'
                    },
                  })}
                >
                  <GoogleAnalytics trackPageViews />
                  <IntercomProvider
                    appId={process.env.NEXT_PUBLIC_INTERCOM_APP_ID || ""}
                    autoBoot
                  >
                    <Component {...pageProps} />
                    <ToastContainer />
                  </IntercomProvider>
                </AppShell>
              </UserContextProvider>
            </SessionContextProvider>
          </NotificationsProvider>
        </MantineProvider>
      </>
    );
  }
  return <></>;
}
