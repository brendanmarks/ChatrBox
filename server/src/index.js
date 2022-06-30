const { ApolloServer, gql, AuthenticationError } = require('apollo-server-express');
const express               = require('express');
require('./config');
const { User, Conversation } = require('./models');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const {MessageManager} = require('./messageManager');

const typeDefs = gql`
    scalar Date

    type Message {
        content: String
        datetime: Date
        sender: String
        readBy: [String]
    }
    type Conversation {
        _id: ID
        members: [String]
        messages: [Message]
    }
    type User {
        username: String
        email: String
        password: String
        conversations: [ID]
    }
    type Query {
        getUsers: [User]
        login(username: String!, password: String!): String
        getUserConversations(username: String!): [Conversation]
    }
    type Mutation {
        addUser(username: String!, email: String!, password: String!): User
        addConversation(members: [String]!): Conversation
    }
`;

const resolvers = {
    Query: {
        getUsers: async () => {
            return await User.find({}).exec();
        },
        getUserConversations: async (_, args) => {
            const user = await User.find({username: args.username}).exec();
            const conversations = await Conversation.find({_id: { $in: user[0].conversations}}).exec();
            return conversations;
        },
        login: async (_, args) => {
            try {
                const user = await User.find({username: args.username}).exec();
                if (user.length < 1) {
                    throw new AuthenticationError("Failed to Authenticate");
                }
                const valid = await bcrypt.compare(args.password, user[0].password);
                if (valid != true) {
                    throw new AuthenticationError("Failed to Authenticate");
                }
                return "Success";
            } catch(e) {
                console.log(e);
                return e.message;
            }
        }
    },
    Mutation: {
        addUser: async (_, args) => {
            try {
                let response = null;
                return bcrypt.hash(args.password, saltRounds, async function(err, hash) {
                    args['password'] = hash; 
                    return response = await User.create(args);
                });
            } catch(e) {
                return e.message;
            }
        },
        addConversation: async (_, args) => {
            try {
                const conversation = await Conversation.create(args);
                conversation.members.forEach(async member => {
                    const u = await User.updateOne(
                        {username: member},
                        {$push: {conversations: conversation._id}}
                    );
                });
                return conversation;
            } catch(e) {
                return e.message;
            }
        }
    }
};

let server = null;
const app = express();

async function startServer() {
    server = new ApolloServer({ typeDefs, resolvers,csrfPrevention: true, cache: 'bounded',cors: {origins: ["http://localhost:3000", 'https://studio.apollographql.com/']}});
    await server.start();
    server.applyMiddleware({ app, cors: {origins: ["http://localhost:3000", 'https://studio.apollographql.com/']} });
}

startServer();
const msgManager = new MessageManager();
console.log(msgManager);
const http = app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000`)
);

const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000",
      }
});
io.on("connection", (socket) => {
    console.log("New client connected");
    console.log(socket.id);
    console.log(socket.handshake.query);
    if (socket.handshake.query?.user !== undefined){
        msgManager.addSocket(socket.handshake.query.user, socket);
    }

    // socket.emit("message", {message: "welcome!", id: socket.id});
    socket.on('disconnect',(reason)=>{
        console.log(reason);
        if (socket.handshake.query?.user !== undefined){
            msgManager.removeSocket(socket.handshake.query.user);
        }
    });
    socket.on("message", async (msg) => {
        await msgManager.sendMessage(msg);
    });
});
io.listen(http);
