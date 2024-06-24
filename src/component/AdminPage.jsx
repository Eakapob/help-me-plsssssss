import React from 'react';
import { Link } from 'react-router-dom';

function AdminPage() {
  return (
    <div>
      <h1>Admin Page</h1>
      <form>
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" />
        <br />
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" />
        <br />
        <Link to="/admindashboard">
          <button type="button">Login</button>
        </Link>
      </form>
    </div>
  );
}

export default AdminPage;
