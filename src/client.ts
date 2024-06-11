class DingTalkCredential {
    clientId: string;
    clientSecret: string;

    constructor(clientId: string, clientSecret: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }
}

interface IEventHandler {
    process(): never;
}


class StreamClient {
    credential: DingTalkCredential;

    constructor(credential: DingTalkCredential) {
        this.credential = credential;
    }

    registerAllEvent(callback: IEventHandler) {
        
    }
}


