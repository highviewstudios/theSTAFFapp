import React, {usestate, useEffect} from 'react';

function Administration() {

  const url = "https://jsonplaceholder.typicode.com/todos/1";

  useEffect(() => {
    getUserAsync()
  },[])

  async function getUserAsync() {
  // let response = await fetch(url, {
  //   method:'GET',
  //   mode:'no-cors', 
  //   headers: {
  //     'Accept': 'application/json',
  //     'Content-Type': 'application/json',
  //     'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, HEAD, OPTIONS'}})
  
  // let data = await response.json({
  //   data: response
  // });
  // console.log(data);
}

  return (
    <div >
      <h1>Administration Page</h1>
    </div>
  );
}

export default Administration;