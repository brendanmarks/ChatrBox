import React, { useState, useEffect } from "react";
import './App.css';
import {TextField, Button, Box, Select, MenuItem} from '@mui/material';
import { useLazyQuery } from '@apollo/client';
import { GET_USERS, GET_USER_CONVERSATIONS } from "./queries";
import {io} from "socket.io-client";
import { SOCKET_URL } from "./config";

function Messenger(props) {
    const [response, setResponse] = useState("");
    const [ourMessage, setOurMessage] = useState("");
    const [users, setUsers] = useState([]);
    const [to, setTo] = useState("");
    const [convos, setConvos] = useState([]);
    const [conversation, setConversation] = useState("");
    const [getUsers, {users_loading, usersData }] = useLazyQuery(GET_USERS);
    const [getUserConversations, {convos_loading, userConversations }] = useLazyQuery(GET_USER_CONVERSATIONS);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io(SOCKET_URL, { query: "user=" + localStorage.getItem('user')});
        setSocket(newSocket);
        newSocket.on("connect", (s) => {
            console.log("connected");
        });
        newSocket.on("message", (msg) => {
            setResponse(msg);
        });
        return () => newSocket.close();
    }, [setSocket]);

    useEffect(() => {
        const username = localStorage.getItem('user');
        getUserConversations({variables: {username}}).then(response => {
            console.log(response);
            setConvos(response);
        });
    }, [userConversations, getUserConversations, convos]);

    useEffect(() => {
     getUsers().then(response => {
       console.log(response.data);
      setUsers(response.data.getUsers);
     });
    }, [users, getUsers, usersData]);
    
    const sendMessage = (msg) => {
      console.log(msg);
      socket.emit("message", {conversation: conversation, message: msg, to: to, from: localStorage.getItem('user')});
    }
    
    const handleToChange = (val) => {
      console.log(val.target);
      setTo(val.target.value);
    }

    return (
        <div>
        <div>
        This Response:
        {response.message}
      </div>
      <div>
        <Box
        component="form"
        noValidate
        autoComplete="off">
        <TextField
            required
            id="send-msg"
            label="Message"
            onChange={val => setOurMessage(val.target.value)}
          />
          
          <Select
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          label="Age"
          value={to}
          onChange={handleToChange}
        >
          {users.map((user,idx) => {
            return <MenuItem
                    value={user.username}
                    key={user.username}
                    >
                    {user.username}
                    </MenuItem>  
          })}
        </Select>
        </Box>
        <Button size="large" variant="outlined" onClick={() => sendMessage(ourMessage)}>Send</Button>
      </div>
      </div>
    );
}


export default Messenger;
