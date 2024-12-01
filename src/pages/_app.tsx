import outputs from "@/../amplify_outputs.json";
import Layout from "@/components/Layout";
import MobileSizeWatcher from "@/components/commons/MobileSizeWatcher";
import ModalProvider from "@/components/commons/Modal";
import ToastProvider from "@/components/commons/Toast/ToastProvider";
import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Amplify } from "aws-amplify";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { useState } from "react";

Amplify.configure(outputs);

const AUTH_PATHS = ["/sign-in", "/on-boarding"];

function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  const router = useRouter();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-9RM3QWE70S"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9RM3QWE70S', {
              page_path: window.location.pathname,
            });`,
        }}
      />

      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          <Head>
            <link rel="icon" href="/images/codeit.svg" />
            <link
              rel="apple-touch-icon"
              sizes="180x180"
              href="/images/codeit.svg"
            />
            <title>Codeit Resources</title>
          </Head>
          <ToastProvider />
          <MobileSizeWatcher />
          <ModalProvider />
          {AUTH_PATHS.includes(router.pathname) ? (
            <Component {...pageProps} />
          ) : (
            <Layout>
              <Component {...pageProps} />
            </Layout>
          )}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </SessionProvider>
    </>
  );
}

export default dynamic(() => Promise.resolve(App), {
  ssr: false,
});
