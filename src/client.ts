import { WebSocket } from "ws";
import axios from "axios";

type OpenConnection = {
    endpoint: string;
    ticket: string;
};

type SubscriptionType = "SYSTEM" | "EVENT" | "CALLBACK";

type Topics = {
    SYSTEM: "ping" | "disconnect";
    EVENT: "*";
    CALLBACK: "robot" | "card";
};


export interface IEventListener {
    onEvent(): never;
}


export class Subscription {
    readonly type: SubscriptionType;
    readonly topic: string;

    private constructor(type: SubscriptionType, topic: string) {
        this.type = type;
        this.topic = topic;
    }

    static create<T extends SubscriptionType>(type: T, topic: Topics[T]) {
        return new Subscription(type, topic);
    }
}

export class Credentials {
    clientId: string;
    clientSecret: string;

    constructor(clientId: string, clientSecret: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }
}


export class StreamClient {
    credentials: Credentials;
    subscriptions: Subscription[];
    eventListener?: IEventListener;

    constructor(credentials: Credentials) {
        this.credentials = credentials;
        this.subscriptions = [];

        const pingSubscription = Subscription.create("SYSTEM", "ping");
        const disconnectSubscription = Subscription.create("SYSTEM", "disconnect");

        this.subscriptions.push(pingSubscription);
        this.subscriptions.push(disconnectSubscription);
    }

    async connect() {
        const url = "https://api.dingtalk.com/v1.0/gateway/connections/open";

        const body = {
            ...this.credentials,
            subscriptions: this.subscriptions,
        };
        const res = await axios.post(url, body);
        
        console.log('res ==> ', res);

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
                this.client.subscriptions.push(subscription);
                this.client.eventListener = listener;
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


