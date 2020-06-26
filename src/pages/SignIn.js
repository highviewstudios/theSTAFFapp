import React from 'react';
import { useHistory } from 'react-router-dom';

function SignIn() {

  const history = useHistory();

  return (
    <div >
      <h1>Sign In Page</h1>

      <button onClick={Run}>Admin</button>
    </div>
  );

  function Run() {
    history.push("/administration");
  }
}

export default SignIn;
