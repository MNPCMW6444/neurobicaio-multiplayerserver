import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer);

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("new-message", (message) => {
        io.emit("new-message", message);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

httpServer.listen(3000, () => {
    console.log("Server is running on port 3000");
});
