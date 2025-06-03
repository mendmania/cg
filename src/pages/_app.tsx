// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import Layout from '@/components/containers/layout/Layout'; // adjust path if needed
import '../app/globals.css'; // if you have global CSS
import { Provider } from 'react-redux';
import { store } from '@/store/store';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>

    <Layout>
      <Component {...pageProps} />
    </Layout>
    </Provider>
  );
}

export default MyApp;
