import {createServer} from "http";
import {Server} from "socket.io";

interface Player {
    email: string;
}

interface StateType {
    games: {
        id: number;
        players: Player[]
    }[];
}

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: ["https://mnpcmwtest.bubbleapps.io", "https://michael-86602.bubbleapps.io"],
        methods: ["GET", "POST"],
    },
});

let state: StateType = {
    games: [],
};

io.on('connection', (socket) => {
    socket.on("createGame", (email: string) => {
        let randomGameNumber = Math.floor(Math.random() * 1000000)
        while (state.games.find(({id}) => id == randomGameNumber))
            randomGameNumber = Math.floor(Math.random() * 1000000)
        state.games.push({
            id: randomGameNumber, players: [{email}]
        });
        socket.emit("gameCreated", randomGameNumber);
    });
    socket.on("joinGame", ({email, wantedGame}: { email: string, wantedGame: number }) => {
        const gameIndex = state.games.findIndex(({id}) => id === wantedGame);
        if (gameIndex !== -1) {
            state.games[gameIndex].players.push({email})
            socket.emit("gameAnswer", true);
        } else socket.emit("gameAnswer", false);
    });
});


httpServer.listen(3000, () => {
    console.log("Server is running on port 3000");
});
