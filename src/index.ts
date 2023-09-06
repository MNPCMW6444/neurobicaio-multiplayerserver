import {createServer} from "http";
import {Server} from "socket.io";

interface Player {
    email: string;
    score: number;
}

interface GameState {
    rooms: {
        id: number;
        players: Player[]
        fightsOn: boolean;
    }[];
}

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: ["https://mnpcmwtest.bubbleapps.io", "https://michael-86602.bubbleapps.io"],
        methods: ["GET", "POST"],
    },
});

let state: GameState = {
    rooms: [],
};

io.on('connection', (socket) => {
    socket.on("createGame", (email: string) => {
        let randomGameNumber = Math.floor(Math.random() * 1000000)
        while (state.rooms.find(({id}) => id == randomGameNumber))
            randomGameNumber = Math.floor(Math.random() * 1000000)
        state.rooms.push({
            id: randomGameNumber, players: [{email, score: NaN}], fightsOn: false
        });
        socket.emit("gameCreated", randomGameNumber);
    });
    socket.on("joinGame", ({email, wantedGame}: { email: string, wantedGame: number }) => {
        const gameIndex = state.rooms.findIndex(({id}) => id === wantedGame);
        if (gameIndex !== -1) {
            state.rooms[gameIndex].players.push({email, score: NaN})
            socket.emit("answer", true);
        } else socket.emit("answer", false);
    });
    socket.on("fightsOn", (gameNum) => {
        const gameIndex = state.rooms.findIndex(({id}) => id === gameNum);
        if (state.rooms[gameIndex].players.length % 2 === 0) {
            state.rooms[gameIndex].fightsOn = true;
            socket.emit("answer", true)
        } else socket.emit("answer", false);
    });
});

const port = process.env.PORT || 3000
httpServer.listen(port, () => {
    console.log("Server is running on port " + port);
});
