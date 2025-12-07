/**
 * CLIENT-SIDE PROVIDERS WRAPPER
 * 
 * Purpose: Wraps the application with necessary providers for state management and authentication.
 * Combines Redux store, persistence layer, and NextAuth session provider.
 * 
 * Architecture Role:
 * - Provider Layer: Sets up global app context (Redux, Session, Persistence)
 * - State Management: Initializes Redux store with persistence
 * - Session Access: Makes auth session available to all client components
 * 
 * Used By: Root layout, wraps entire application
 */

"use client";

import React from "react";
import { Provider } from "react-redux";
import { makeStore } from "../lib/store";
import { PersistGate } from "redux-persist/integration/react";
import SpinnerbLoader from "@/components/ui/SpinnerbLoader";
import { SessionProvider } from "next-auth/react";

type Props = {
  children: React.ReactNode;
};

const Providers = ({ children }: Props) => {
  const { store, persistor } = makeStore();

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="flex items-center justify-center h-96">
            <SpinnerbLoader className="w-10 border-2 border-gray-300 border-r-gray-600" />
          </div>
        }
        persistor={persistor}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </PersistGate>
    </Provider>
  );
};

export default Providers;
