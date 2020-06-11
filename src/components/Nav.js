import React from 'react';
import {Link} from 'react-router-dom';

function Nav() {
  return (
    <nav>
        <h3>Logo</h3>
        <ul className="nav-links">
            <Link to="/signin">
                <li>Sign In</li>
            </Link>
            <Link to="/administration">
                <li>Administration</li>
            </Link>
        </ul>
    </nav>
  );
}

export default Nav;