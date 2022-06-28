import React, { useState, useEffect} from 'react';
import {Navigate} from "react-router-dom";
import {TextField, Button, Box} from '@mui/material';
import { LOGIN } from './queries';
import { useLazyQuery } from '@apollo/client';

function Login(props) {
    const [authenticated, setAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [tryLogin] = useLazyQuery(LOGIN, {fetchPolicy: 'no-cache', onCompleted: data => {
        console.log(data);
        setAuthenticated(true);
        localStorage.setItem("user", username);
        localStorage.setItem('isAuthenticated', 'true');
    }});

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
                  <TextField
                    required
                    id="send-msg"
                    label="Password"
                    onChange={val => setPassword(val.target.value)}
                  />
                </Box>
                <Button size="large" variant="outlined" onClick={() => tryLogin({variables: {username, password}})}>Login</Button>
                </div>
            }
            {authenticated &&
                <Navigate to={'/'}></Navigate>
            }
        </div>
    );
}

export default Login;