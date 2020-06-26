import React, {usestate, useEffect, useState} from 'react';
import { Redirect, useHistory } from 'react-router-dom';

function SignIn() {

  const history = useHistory();

  
  
  return (
    <div >
      <h1>Sign In Page</h1>

      <button onClick={Run}>Hello</button>
    </div>
  );

  function Run() {
    alert("HELLO");
    history.push("/administration");
  }
}

export default SignIn;
