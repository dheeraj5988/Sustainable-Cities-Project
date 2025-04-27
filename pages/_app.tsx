// If this file exists, we need to remove it or update it
import type { AppProps } from "next/app"

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
