import { StreamClient } from "../client.js";

const client = StreamClient.builder().credentials({ clientId: "", clientSecret: "" }).build()
client.connect()
