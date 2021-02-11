import React, {useState, useEffect} from 'react';
import Axios from 'axios';
import {useDispatch} from 'react-redux';
import {userUpdateAuth, userUpdateName, userUpdateRole, userUpdateNew, userUpdateRequestedPassword, userUpdateOrgID, userUpdateUserDepartments, userUpdateSARequest, userUpdateUUID, userUpdateProfiles} from './store/actions/user'
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';

import "./public/styles.css";
import "./public/organisationAdmin.css";
import './public/organisationHome.css';
import './public/home.css';

import BetaBanner from "./components/NavBar/betaBanner";
import Nav from "./components/NavBar/Nav";

import Home from "./pages/home";

import NotConnected from "./pages/notConnected";
import WrongLogin from "./pages/wrongLogin";
import OrganisationRouter from './pages/organisationRouter';
import Book from './pages/book';

import AdminHome from "./pages/administrator/home";
import AdminSignIn from "./pages/administrator/signIn";
import AdminOrgRegister from "./pages/administrator/registerOrganisation";

import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import OrganisationNotFound from './pages/organisationNotFound';

function App() {

  const dispatch = useDispatch();
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    onOpen();
  },[]);

  //another useEffect with the force sign in const

  function onOpen() {
    Axios.get("/auth", {withCredentials: true })
  .then(res => {
      console.log(res.data);//-------------
      const isAuth = res.data.auth;
      dispatch(userUpdateAuth(isAuth));
      if(isAuth) {
        if(res.data.role == "superAdmin") {
          dispatch(userUpdateName("High-ViewStudios"));
          dispatch(userUpdateRole("superAdmin"));
        } else {
          dispatch(userUpdateUUID(res.data.user.uuid));
          dispatch(userUpdateName(res.data.user.displayName));
          dispatch(userUpdateRole(res.data.user.role));
          dispatch(userUpdateNew(res.data.user.new));
          dispatch(userUpdateRequestedPassword(res.data.user.requestedPassword));
          dispatch(userUpdateOrgID(res.data.user.orgID));
          dispatch(userUpdateUserDepartments(res.data.user.departments));
          dispatch(userUpdateSARequest(res.data.user.SARequest));
          dispatch(userUpdateProfiles(res.data.user.userProfiles));

          //get organisation
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
      <BetaBanner />
        <Nav />
        <Switch>
        {/* MAIN WEBSITE HOME */}
          <Route path="/" exact component={Home} /> {/* DO NOT TOUCH */}
        {/* ADMINISTRATION */}
        <Route path="/administrator" exact component={AdminHome} /> {/* DO NOT TOUCH */}
        <Route path="/administrator/signIn" component={AdminSignIn} /> {/* DO NOT TOUCH */}
        <Route path="/administrator/organisationRegister" component={AdminOrgRegister} />

        {/* ORGANISATION/USER */}
              <Route path="/org/:id" exact component={OrganisationRouter} />
              <Route path="/org/:id/collisionBookings" component={OrganisationRouter} />
              <Route path="/org/:id/organisationAdmin" component={OrganisationRouter} />
              <Route path="/org/:id/signIn" component={OrganisationRouter} />    
              <Route path="/org/:id/forgotPassword" component={OrganisationRouter} />
              <Route path="/org/:id/changePassword" component={OrganisationRouter} />
              <Route path="/org/:id/changeOfSeniorRequest" component={OrganisationRouter} /> 
              <Route path="/org/:id/createPassword" component={OrganisationRouter} />
              <Route path='/org/:id/wrongOrganisation' component={OrganisationRouter} />
              <Route path="/org/:id/userDetails" component={OrganisationRouter} />
              <Route path="/org/:id/profileSettings" component={OrganisationRouter} />

              <Route path="/organisationNotFound" component={OrganisationNotFound} />

              {/* not moving this until later versions */}
              <Route path='/org/:id/book' component={Book} />

        {/* coming direct from passport */}
        <Route path="/org/:id/wrongLogin/" component={WrongLogin} />

        <Route path="/notConnected" component={NotConnected} />        

        </Switch>
      </div>
    </Router>) : <div></div>}
    </div>
  );
}

export default App;
