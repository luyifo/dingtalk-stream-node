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
    readonly type: keyof Topics;
    readonly topic: Topics[keyof Topics];

    private constructor(type: keyof Topics, topic: Topics[keyof Topics]) {
        this.type = type;
        this.topic = topic;
    }

    static create<T extends keyof Topics, K extends Topics[T]>(type: T, topic: K) {
        return new Subscription(type, topic);
    }
};


type SubscriptionMap = Partial<{ [Property in keyof Topics]: Subscription[] }>;

interface Config {

}

export class StreamClient {
    credentials: Credentials;
    subscriptionMap?: SubscriptionMap;
    config?: Config;

    constructor(credentials: Credentials, config?: Config) {
        this.credentials = credentials;
        if (config) {
            this.config = config;
        }
    }

    private registerSystem() {
        // const s = Subscription.create("CALLBACK", "card");
    }

    private subscribe(subscription: Subscription) {
        
        if (!(subscription instanceof Subscription)) {
            const { type, topic } = subscription as Subscription;
            throw new Error("subscription must be an instance of Subscription");
        }

        if (!this.subscriptionMap) {
            this.subscriptionMap = {};
        }

        if (!this.subscriptionMap[subscription.type]) {
            const subscriptions: Subscription[] = [];
            this.subscriptionMap[subscription.type] = subscriptions;
        }

        this.subscriptionMap[subscription.type]?.push(subscription);
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


    registerAllEvent(listener: IEventListener) {
        const subscription = Subscription.create("EVENT", "*");
        // this.client.subscriptions.push(subscription);
        // this.client.eventListener = listener;
        return this;
    }


    async connect() {
        const { endpoint, ticket } = await this.openConnection();
        const webSocket = new WebSocket(`${endpoint}?ticket=${ticket}`);

    }

    start() {
        console.log("start");
    }
}
