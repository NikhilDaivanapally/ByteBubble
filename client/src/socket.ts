import { io, Socket } from "socket.io-client";
import msgpackParser from "socket.io-msgpack-parser";

let socket: Socket;

const connectSocket = (auth_id: string): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    if (socket && socket.connected) {
      return resolve(socket); // Already connected
    }

    socket = io("https://bytebubble.onrender.com", {
      query: { auth_id },
      transports: ["websocket"],
      parser: msgpackParser,
    });

    socket.once("connect", () => {
      resolve(socket);
    });

    socket.once("connect_error", (err: Error) => {
      reject(err);
    });
  });
};

export { socket, connectSocket };
