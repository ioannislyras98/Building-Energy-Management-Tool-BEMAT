import { Link, Outlet } from "react-router-dom";

const Layout = () => (
  <div>
    <ul>
      <li>
        <Link to="/login">Login</Link>
      </li>
      <li>
        <Link to="/signup">Signup</Link>
      </li>
    </ul>
    <Outlet />
  </div>
);
export default Layout;
