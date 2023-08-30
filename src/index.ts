import { createServer } from "http";
import { Server } from "socket.io";

interface Player {
  id: string;
  x: number;
  y: number;
}

interface GameState {
  players: Player[];
}

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["https://mnpcmwtest.bubbleapps.io"],
    methods: ["GET", "POST"],
  },
});

let gameState: GameState = {
  players: [],
};

io.on("connection", (socket) => {
  // Assign a new ID for the connected player and add to game state
  const newPlayer: Player = { id: socket.id, x: 0, y: 0 };
  gameState.players.push(newPlayer);

  // Notify existing clients of the new player
  socket.broadcast.emit("new-player", newPlayer);

  // On receiving a move event, update game state and broadcast to all clients
  socket.on("move", (moveData) => {
    const player = gameState.players.find((p) => p.id === socket.id);
    if (player) {
      player.x += moveData.dx;
      player.y += moveData.dy;
      io.emit("game-update", gameState);
    }
  });

  // On disconnect, remove the player from the game state
  socket.on("disconnect", () => {
    gameState.players = gameState.players.filter((p) => p.id !== socket.id);
    io.emit("player-left", socket.id);
  });
});

httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
});
