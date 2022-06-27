const { ApolloServer, gql } = require('apollo-server-express');
const express               = require('express');
require('./config');
const { User } = require('./models');

const typeDefs = gql`
    type User {
        id: ID!
        username: String
        email: String
    }
    type Query {
        getUsers: [User]
    }
    type Mutation {
        addUser(username: String!, email: String!): User
    }
`;

const resolvers = {
    Query: {
        getUsers: async () => {
            console.log("getting users");
            return await User.find({}).exec();
        }
    },
    Mutation: {
        addUser: async (_, args) => {
            try {
                let response = await User.create(args);
                return response;
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
