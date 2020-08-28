import React, {useState, useEffect} from 'react';
import Axios from 'axios';
import {useDispatch} from 'react-redux';
import {userUpdateAuth, userUpdateName, userUpdateRole, userUpdateNew, userUpdateRequestedPassword, userUpdateOrgID, userUpdateUserDepartments} from './store/actions/user'
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import "./public/styles.css";
import "./public/organisationAdmin.css";
import './public/organisationHome.css';

import Nav from "./components/NavBar/Nav";

import Home from "./pages/home";
import SignIn from "./pages/signIn";
import CreatePassword from "./pages/createPassword";
import ForgotPassword from "./pages/forgotPassword";
import ChangePassword from './pages/changePassword';
import WrongOrganisation from './pages/wrongOrganisation';

import NotConnected from "./pages/notConnected";
import WrongLogin from "./pages/wrongLogin";
import OrganisationAdmin from "./pages/organisationAdmin";
import OrganisationHome from "./pages/organisationHome";
import Book from './pages/book';

import AdminHome from "./pages/administrator/home";
import AdminSignIn from "./pages/administrator/signIn";
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
      //console.log(res.data);
      const isAuth = res.data.auth;
      dispatch(userUpdateAuth(isAuth));
      if(isAuth) {
        if(res.data.role == "superAdmin") {
          dispatch(userUpdateName("High-ViewStudios"));
          dispatch(userUpdateRole("superAdmin"));
        } else {
          dispatch(userUpdateName(res.data.user.displayName));
          dispatch(userUpdateRole(res.data.user.role));
          dispatch(userUpdateNew(res.data.user.new));
          dispatch(userUpdateRequestedPassword(res.data.user.requestedPassword));
          dispatch(userUpdateOrgID(res.data.user.orgID));
          dispatch(userUpdateUserDepartments(res.data.user.departments));
        }
      }
      setLoaded(true);
  })
  .catch(err => {
      console.log("Authe" +err);
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
        <Route path="/org/:id" exact component={OrganisationHome} />
        <Route path="/org/:id/organisationAdmin" component={OrganisationAdmin} />
        <Route path='/org/:id/book' component={Book} />

        <Route path="/org/:id/signIn" component={SignIn} /> {/* DO NOT TOUCH */}
        <Route path="/org/:id/forgotPassword" component={ForgotPassword} />
        <Route path="/org/:id/changePassword" component={ChangePassword} />
        <Route path="/org/:id/createPassword" component={CreatePassword} />
        <Route path='/org/:id/wrongOrganisation' component={WrongOrganisation} />
        <Route path="/org/:id/wrongLogin/" component={WrongLogin} />

        <Route path="/notConnected" component={NotConnected} />        

        {/* ADMINISTRATION */}
        <Route path="/administrator" exact component={AdminHome} /> {/* DO NOT TOUCH */}
        <Route path="/administrator/signIn" component={AdminSignIn} /> {/* DO NOT TOUCH */}
        <Route path="/administrator/organisationRegister" component={AdminOrgRegister} />
        </Switch>
      </div>
    </Router>) : <div></div>}
    </div>
  );
}

export default App;
