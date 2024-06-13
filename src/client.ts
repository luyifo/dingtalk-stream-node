import axios, { AxiosError, isAxiosError } from "axios";
import { WebSocket } from "ws";

export interface Credentials {
    clientId: string;
    clientSecret: string;
}

export interface AckMessage {
    status: "SUCCESS" | "LATER",
    message?: string;
};

export interface IEventListener {
    receive(): AckMessage;
}

interface Topics {
    SYSTEM: "ping" | "disconnect";
    EVENT: "*";
    CALLBACK: "robot" | "card";
};

export class Subscription {
    readonly type: string;
    readonly topic: string;

    private constructor(type: string, topic: string) {
        this.type = type;
        this.topic = topic;
    }

    static create<T extends keyof Topics, K extends Topics[T]>(type: T, topic: K) {
        return new Subscription(type, topic);
    }
};


type SubscriptionMap = {
    messageType: keyof Topics,
    subscriptions: Subscription[];
};



export class StreamClient {
    credentials: Credentials;
    // subscriptions: Subscription[];
    subscriptionMaps: SubscriptionMap[];

    constructor(credentials: Credentials) {
        this.credentials = credentials;
        const subscriptions = [];

        subscriptions.push(Subscription.create("SYSTEM", "ping"));
        subscriptions.push(Subscription.create("SYSTEM", "disconnect"));
        this.subscriptionMaps = [];
        this.subscriptionMaps.push({ messageType: "SYSTEM", subscriptions: subscriptions });
    }

    private async openConnection() {
        const url = "https://api.dingtalk.com/v1.0/gateway/connections/open";
        const body = {
            ...this.credentials,
            // subscriptions: this.subscriptions,
        };

        try {
            const res = await axios.post(url, body);
            return res.data;
        } catch (error) {
            if (isAxiosError(error)) {
                throw new Error(error.response?.data);
            }
            throw new Error((error as Error).message);
        }
    }

    async connect() {
        const { endpoint, ticket } = await this.openConnection();
        const webSocket = new WebSocket(`${endpoint}?ticket=${ticket}`);

    }

    start() {
        console.log("start");
    }

    static builder() {
        // return new this.StreamClientBuilder();
        class StreamClientBuilder {
            client!: StreamClient;

            constructor() { }

            credentials(credentials: Credentials) {
                if (!this.client) {
                    this.client = new StreamClient(credentials);
                }
                return this;
            }

            registerAllEvent(listener: IEventListener) {
                const subscription = Subscription.create("EVENT", "*");
                // this.client.subscriptions.push(subscription);
                // this.client.eventListener = listener;
                return this;
            }

            build() {
                if (!this.client) {
                    throw new Error("Credentials must be provided first");
                }
                return this.client;
            }
        };

        return new StreamClientBuilder();
    }
}
