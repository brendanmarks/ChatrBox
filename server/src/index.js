const { ApolloServer, gql, AuthenticationError } = require('apollo-server-express');
const express               = require('express');
require('./config');
const { User } = require('./models');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const typeDefs = gql`
    scalar Date

    type Message {
        content: String
        datetime: Date
        sender: ID
    }
    type Conversation {
        members: [String]
        messages: [ID]
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
    }
    type Mutation {
        addUser(username: String!, email: String!, password: String!): User
    }
`;

const resolvers = {
    Query: {
        getUsers: async () => {
            return await User.find({}).exec();
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
    socket.emit("message", {message: "welcome!", id: socket.id});
    socket.on('disconnect',(reason)=>{
        console.log(reason);
    });
    socket.on("message", (msg) => {
        console.log("got message " + msg.message);
        socket.emit("message", {message: msg.message, id: socket.id});
    });
});
io.listen(http);
