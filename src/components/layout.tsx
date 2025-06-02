"use client";
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './SocketProvider';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <SocketProvider>
        <div>
          {children}
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </SocketProvider>
    </SessionProvider>
  );
};

export default Layout;
