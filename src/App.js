import React from 'react';
import "./public/styles.css";

import Nav from "./components/Nav";

import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import Adminitration from "./pages/Administration";

import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App" >
        <Nav />
        <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/signin" component={SignIn} />
        <Route path="/administration" component={Adminitration} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
