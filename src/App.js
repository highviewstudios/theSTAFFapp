import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import "./public/styles.css";

import Nav from "./components/Nav";

import Auth from "./pages/auth";
import Home from "./pages/home";
import SignIn from "./pages/signIn";
import Register from "./pages/register";

import AdminAuth from "./pages/administrator/auth";
import AdminHome from "./pages/administrator/home";
import AdminSignIn from "./pages/administrator/signin";

import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import UserContextProvider from './context/userContext';
import AdminContextProvider from './context/adminContext';

function App() {
  return (
    <UserContextProvider>
    <AdminContextProvider>
    <Router>
      <div className="App" >
        <Nav />
        <Switch>
        <Route path="/" exact component={Auth} />
        <Route path="/home" component={Home} />
        <Route path="/signin" component={SignIn} />
        <Route path="/register" component={Register} />
        <Route path="/administrator" exact component={AdminAuth} />
        <Route path="/administrator/home" component={AdminHome} />
        <Route path="/administrator/signin" component={AdminSignIn} />
        </Switch>
      </div>
    </Router>
    </AdminContextProvider>
    </UserContextProvider>
  );
}

export default App;
