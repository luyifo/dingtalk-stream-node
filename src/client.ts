import axios, { isAxiosError } from "axios";
import { WebSocket } from "ws";
import pkg from "../package.json";
import { MessageType, StreamMessage } from "./message";
import { IEventHandler } from "./handlers";

export interface Credentials {
  clientId: string;
  clientSecret: string;
}

interface Topics {
  SYSTEM: "ping" | "disconnect";
  EVENT: "*";
  CALLBACK: "robot" | "card";
}

export class Subscription {
  private constructor(
    readonly type: keyof Topics,
    readonly topic: Topics[keyof Topics]
  ) {
    this.type = type;
    this.topic = topic;
  }

  static create<T extends keyof Topics, K extends Topics[T]>(
    type: T,
    topic: K
  ) {
    return new Subscription(type, topic);
  }
}

type SubscriptionMap = {
  [Property in keyof Topics]: {
    subscriptions: Subscription[];
    handler?: IEventHandler;
  };
};

class SubscriptionManager {
  subscriptionMap = {} as SubscriptionMap;

  subscribe(subscription: Subscription, handler: IEventHandler): void | never {
    if (!(subscription instanceof Subscription)) {
      throw new Error("subscription must be an instance of Subscription");
    }

    if (!this.subscriptionMap[subscription.type]) {
      this.subscriptionMap[subscription.type] = {
        subscriptions: [],
      };
    }

    this.subscriptionMap[subscription.type].subscriptions.push(subscription);
    this.subscriptionMap[subscription.type].handler = handler;
  }
}

export class StreamClient {
  private credentials;
  private subscriptionMananger: SubscriptionManager;
  private socket?: WebSocket;
  hearbeatInterval?: NodeJS.Timeout;

  constructor(credentials: Credentials) {
    this.credentials = credentials;
    this.subscriptionMananger = new SubscriptionManager();
  }

  private async openConnection(): Promise<any> | never {
    const publicIp = await getPublicIp();
    const url = "https://api.dingtalk.com/v1.0/gateway/connections/open";
    const subscriptions = Object.values(this.subscriptionMananger).flatMap(
      (item) => item
    );
    subscriptions.push(Subscription.create("SYSTEM", "ping"));
    subscriptions.push(Subscription.create("SYSTEM", "disconnect"));
    const body = {
      ...this.credentials,
      localIp: publicIp,
      ua: `dingtalk-stream-node/${pkg.version}`,
      subscriptions,
    };

    try {
      const res = await axios.post(url, body);
      return res.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error.response?.data);
      }
      throw error;
    }
  }

  registerAllEvent(handler: IEventHandler): this | never {
    this.subscriptionMananger.subscribe(
      Subscription.create("EVENT", "*"),
      handler
    );
    return this;
  }

  async connect() {
    const { endpoint, ticket } = await this.openConnection();
    this.socket = new WebSocket(`${endpoint}?ticket=${ticket}`);

    this.socket.on("open", () => {
      console.log("The connection has been established");
      this.hearbeatInterval = setInterval(() => {
        this.socket?.ping();
      }, 10000);
    });

    this.socket.on("message", (data: string) => {
      const message: StreamMessage = JSON.parse(data);
      if (message.type == MessageType.SYSTEM) {
        const headers = message.headers;
        if (headers.topic === "ping") {
          this.socket?.send(
            JSON.stringify({
              code: 200,
              headers: message.headers,
              message: "ok",
              data: message.data,
            })
          );
        } else if (headers.topic === "disconnect") {
          this.socket?.close();
        }
      } else {
        this.subscriptionMananger.subscriptionMap[
          message["type"]
        ].handler?.handle(message);
      }
    });

    this.socket.on("close", () => {
      clearInterval(this.hearbeatInterval);
      this.connect();
    });
  }
}

async function getPublicIp(): Promise<any> | never {
  try {
    const res = await axios.get("https://api.ipify.org?format=json");
    return res.data.ip;
  } catch (error) {
    console.error("Error fetching public IP address:", error);
    throw error;
  }
}
