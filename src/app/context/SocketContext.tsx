import React, { createContext } from "react";
import { io, Socket } from "socket.io-client";
import { serverApiBase } from "../../lib/config";

const socketUrl =
  serverApiBase ||
  (typeof window !== "undefined" ? window.location.origin : "");

const socket = io(socketUrl, {
  withCredentials: true,
});
export const SocketContext = createContext<Socket>(socket);

interface SocketProviderProps {
  children: React.ReactNode;
}
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
