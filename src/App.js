import React, {useState, useEffect} from 'react';
import Axios from 'axios';
import {useDispatch} from 'react-redux';
import {userUpdateAuth, userUpdateName, userUpdateRole} from './store/actions'

import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import "./public/styles.css";

import Nav from "./components/NavBar/Nav";

import Home from "./pages/home";
import SignIn from "./pages/signIn";
import Register from "./pages/register";
import UserTest from "./pages/userTest"

import AdminHome from "./pages/administrator/home";
import AdminSignIn from "./pages/administrator/signin";
import AdminOrgRegister from "./pages/administrator/registerOrganisation";

import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

function App() {

  const dispatch = useDispatch();
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    onOpen();
  },[])

  function onOpen() {
    Axios.get("/auth", {withCredentials: true })
  .then(res => {

      console.log(res.data);
      const isAuth = res.data.auth;
      dispatch(userUpdateAuth(isAuth));
      if(isAuth) {
        if(res.data.role == "superAdmin") {
          dispatch(userUpdateName("High-ViewStudios"));
        } else {
          dispatch(userUpdateName(res.data.user.displayName));
        }
        dispatch(userUpdateRole(res.data.role))
      }
      setLoaded(true);
  })
  .catch(err => {
      console.log("Auth " +err);
  })
  }

  return (
    <div>
    {isLoaded ? (   
    <Router>
      <div className="App" >
        <Nav />
        <Switch>
        {/* USER */}
        <Route path="/" exact component={Home} /> {/* DO NOT TOUCH */}
        <Route path="/signin" component={SignIn} /> {/* DO NOT TOUCH */}
        <Route path="/register" component={Register} />

        {/* ADMINISTRATION */}
        <Route path="/administrator" exact component={AdminHome} /> {/* DO NOT TOUCH */}
        <Route path="/administrator/signin" component={AdminSignIn} /> {/* DO NOT TOUCH */}
        <Route path="/administrator/organisationRegister" component={AdminOrgRegister} />
        </Switch>
      </div>
    </Router>) : <div></div>}
    </div>
  );
}

export default App;
