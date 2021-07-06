import WebSocket from "ws";
import { v4 as uuidv4 } from 'uuid';

interface PlayerRouterConfig {
    id?: string,
    playerRouterURL: Array<string>,
    gameServerURL: string,
    user: string,
    password: string,
    labels: { [_type: string]: string }
};

class PlayerRouter {
    private config: PlayerRouterConfig;
    private playerCount = 0;
    private socket: any;

    constructor(config: PlayerRouterConfig) {
        config.id = config.id || uuidv4();
        this.config = config;

        this.attemptConnect();
    }

    send(type: string, obj: any) {

        if(!this.socket) {
            return;
        }

        this.socket.send(JSON.stringify({
            type,
            ...obj
        }));
    }

    attemptConnect() {

        console.log(`Attempting to connect to Player Router server: ${this.config.playerRouterURL[0]}`);
        this.socket = new WebSocket(this.config.playerRouterURL[0]);

        this.socket.on("open", () => {
            console.log("Connected to Player Router");
            this.register();
        });

        this.socket.on("error", (error) => {
            console.log("----- connect error")
            console.log(error);
        });

        this.socket.on("close", (code: number, reason: string) => {
            console.log("Disconnected from Player Router server");
            console.log(`Code: ${code}, reason: ${reason}`);
            this.socket = null;

            setTimeout(() => this.attemptConnect(), 2000);
        });
    }

    private register() {
        console.log("Attempting to register to Player Router...");

        this.send("register", {
            ...this.config,
            playerCount: this.playerCount
        });
    }

    public setPlayerCount(count) {
        this.playerCount = count;

        if(this.socket) {
            this.send("playerCount", {count});
        }
    }
}

class PlayerRouterSingleton {
    private static instance: PlayerRouter;

    public static Setup(config: PlayerRouterConfig) {

        if(!PlayerRouterSingleton.instance) {
            PlayerRouterSingleton.instance = new PlayerRouter(config);
        }
    }

    public static Get() {
        return PlayerRouterSingleton.instance;
    }
}

export {
    PlayerRouter,
    PlayerRouterSingleton
};
