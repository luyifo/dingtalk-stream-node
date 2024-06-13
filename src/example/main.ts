// export const enum MessageType {
//     SYSTEM = "SYSTEM",
//     EVENT = "EVENT",
//     CALLBACK = "CALLBACK"
// }

// console.log(typeof MessageType.SYSTEM)
// console.log(MessageType.SYSTEM)

// interface Subscription {
//     type:string
//     topic:string
// }

// const sub:Subscription = {type:"ss",topic:"s"}

class Subscription {
    type: string;
    topic: string;
    constructor(type: string, topic: string) {
        this.type = type;
        this.topic = topic;
    }
}

function fn(sub: Subscription) {
    console.log(typeof sub);
    console.log(sub instanceof Subscription);
}
fn(new Subscription("sfsfs","sfsafs"))

fn({type:"ss",topic:"fsaf"})

