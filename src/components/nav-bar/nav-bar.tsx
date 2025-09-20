import { NavLink } from "react-router";

export const NavBar = () => {
  return (
    <nav className="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/">
          Lucks Run
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbar-collapse"
          aria-controls="navbar-collapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbar-collapse">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/avandras-favor">
                Avandra's Favor
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/gambit-of-ord">
                Gambit of Ord
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/quon-a-drensal">
                Quon a Drensal
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
