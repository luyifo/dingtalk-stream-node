import { StreamClient } from "../client";
import { AckMessage, AckMessageStatus, IEventHandler } from "../handlers";
import { StreamMessage } from "../message";

const client = new StreamClient({
  clientId: "clientId",
  clientSecret: "clientSecret",
});

class Eventhandler implements IEventHandler {
  handle(message: StreamMessage): AckMessage {
    // Do something here

    return {
      status: AckMessageStatus.SUCCESS,
      message: "ok",
    };
  }
}

client.registerAllEvent(new Eventhandler()).connect();
