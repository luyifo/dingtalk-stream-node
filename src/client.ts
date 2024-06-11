import { WebSocket } from "ws";
import got from "got";

const webSocket = new WebSocket("");
class DingTalkCredential {
    clientId: string;
    clientSecret: string;

    constructor(clientId: string, clientSecret: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }
}

interface IEventListener {
    onEvent(): never;
}

type SubscriptionType = "SYSTEM" | "EVENT" | "CALLBACK";

type Topics = {
    SYSTEM: "ping" | "disconnect";
    EVENT: "*";
    CALLBACK: "robot" | "card";
};


class Subscription {
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



class StreamClient {
    credential: DingTalkCredential;
    subscriptions: Subscription[];

    constructor(credential: DingTalkCredential) {
        this.credential = credential;
        this.subscriptions = [];

        const pingSubscription = Subscription.create("SYSTEM", "ping");
        const disconnectSubscription = Subscription.create("SYSTEM", "disconnect");

        this.subscriptions.push(pingSubscription);
        this.subscriptions.push(disconnectSubscription);
    }

    registerAllEvent(listener: IEventListener) {
        const subscription = Subscription.create("EVENT", "*");
        this.subscriptions.push(subscription);
    }

    async connect() {
        const url = "https://api.dingtalk.com/v1.0/gateway/connections/open";

        const body = {
            ...this.credential,
            subscriptions: this.subscriptions,
        };
        const { data } = await got.post(url, { json: body }).json();
        console.log('data ==> ', data);
    }
}


