export type User = {
  _id: string;
  userName: string;
  email: string;
  avatar?: string;
  about?: string;
  createdAt: string;
  updatedAt: string;
  socketId: string;
  status: "Online" | "Offline" | string;
};
