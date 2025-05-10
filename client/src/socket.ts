import { io } from "socket.io-client";

let socket: any;

const connectSocket = (auth_id: string) => {
  return new Promise((resolve, reject) => {
    socket = io("http://localhost:8000", {
      query: { auth_id },
    });

    socket.on("connect", () => {
      resolve(socket);
    });

    socket.on("connect_error", (err: Error) => {
      reject(err);
    });
  });
};

export { socket, connectSocket };
