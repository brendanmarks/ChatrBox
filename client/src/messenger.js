import React, { useState, useEffect } from "react";
import './App.css';
import {socket} from './socket';
import {TextField, Button, Box, Select, MenuItem} from '@mui/material';
import { useLazyQuery } from '@apollo/client';
import { GET_USERS } from "./queries";

function Messenger(props) {
    const [response, setResponse] = useState("");
    const [ourMessage, setOurMessage] = useState("");
    const [users, setUsers] = useState([]);
    const [to, setTo] = useState("");
    
    const [getUsers, {loading, usersData }] = useLazyQuery(GET_USERS);
    
    useEffect(() => {
      socket.on("connect", (s) => {
        console.log("connected");
      });
      socket.on("message", (msg) => {
        setResponse(msg);
      })
    }, [response])
    
    useEffect(() => {
     getUsers().then(response => {
       console.log(response.data);
      setUsers(response.data.getUsers);
     });
    }, [users, getUsers, usersData])
    
    const sendMessage = (msg) => {
      console.log(msg);
      socket.emit("message", {message: msg, to: to, from: socket.id})
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
                    value={user.id}
                    key={user.id}
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
