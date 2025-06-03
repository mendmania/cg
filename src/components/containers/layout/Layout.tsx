// src/components/Layout.tsx
import { ReactNode } from 'react';
import { Header } from '@/components/containers/header/Header';
import { Footer } from '@/components/containers/footer/Footer';

type LayoutProps = {
    children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
    return (
        <>
            {/* <Header /> */}
            <main style={{ minHeight: '80vh' }}>{children}</main>
            {/* <Footer /> */}
        </>
    );
}
