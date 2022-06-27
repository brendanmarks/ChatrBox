import React, { useState, useEffect} from 'react';
import {Navigate} from "react-router-dom";
import {TextField, Button, Box} from '@mui/material';
import { GET_USERS } from './queries';
import { useLazyQuery } from '@apollo/client';

function Login(props) {
    const [authenticated, setAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    const [getUsers, {loading, usersData }] = useLazyQuery(GET_USERS);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        getUsers().then(response => {
          console.log(response.data);
         setUsers(response.data.getUsers);
        });
    }, [users, getUsers, usersData])

    const login = (val) => {
        if (users.filter(e => e.username === val).length > 0) {
            setAuthenticated(true);
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("username", val);
        }
    }

    return (
        <div> 
            {!authenticated &&
                <div>
                <Box
                component="form"
                noValidate
                autoComplete="off">
                <TextField
                    required
                    id="send-msg"
                    label="Username"
                    onChange={val => setUsername(val.target.value)}
                  />
                </Box>
                <Button size="large" variant="outlined" onClick={() => login(username)}>Login</Button>
                </div>
            }
            {authenticated &&
                <Navigate to={'/'}></Navigate>
            }
        </div>
    );
}

export default Login;