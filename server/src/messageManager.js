const { Message, Conversation } = require("./models");

class MessageManager {
    constructor() {
        if (MessageManager._instance) {
            return MessageManager._instance;
        }
        MessageManager._instance = this;
        this.socketmap = {};
    }

    removeSocket(client) {
        this.socketmap[client] = null;
    }

    addSocket(client, socket) {
        this.socketmap[client] = socket;
    }

    async sendMessage(msg) {
        console.log(msg);
        if (this.socketmap[msg.to] !== undefined) {
            this.socketmap[msg.to].emit("message", msg);
        }
        const message = {
            content: msg.message,
            datetime: Date.now(),
            sender: msg.from,
            readBy: [msg.from]
        }
        const m = await Message.create(message);
        console.log(m);
        if (msg.conversation !== null) {
            const conversation = await Conversation.updateOne({_id: conversation}, {$push: {messages: m}});
        }
        return m;
    }
}

module.exports = {
    MessageManager
};
