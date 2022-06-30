import React from "react";
import Messenger from "./messenger";
import './App.css';
import {Routes, Route, Navigate, useLocation} from "react-router-dom";
import Login from './login';

function App(props) {

  const Private = ({Component}, ...restOfProps) => {
    const auth = localStorage.getItem("isAuthenticated") === "true";
    const location = useLocation();
    console.log(location);
    console.log(auth);
    return auth ? <Component {...restOfProps}/> : <Navigate to="/login"/>;
  }
  return (
      <Routes>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/' element={<Private Component={Messenger} client={props.client}/>}></Route>
      </Routes>
  );
}

export default App;
