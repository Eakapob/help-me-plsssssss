import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


function AdminPage() {

    // const [email, setEmail] = useState("");
    // const [password, setPassword] = useState("");
    // const [error, setError] = useState("");
    // const { logIn } = userAuthContext();

    // let navigate = useNavigate();
    

    return (
      <div>
        <div className='flex justify-center text-center'>
          <h1 className='bg-green-400 text-white p-5 w-1/2'>Admin Page</h1>
        </div>
        <div className='text-center border-2 flex justify-center h-full'>
          <div className='mt-0 p-20 w-1/2 bg-green-200'>
            <form>
              <label htmlFor="username">Username:</label>
              <input className='border-2' type="text" id="username" />
              <br/>
              <label htmlFor="password">Password:</label>
              <input className='border-2' type="password" id="password" />
              <br/>
              <Link to="/admindashboard">
                <button className='bg-blue-500 hover:bg-blue-700 text-white rounded' type="button">Login</button>
              </Link>
            </form>
          </div>
        </div>
      </div>
    );
}

export default AdminPage;
