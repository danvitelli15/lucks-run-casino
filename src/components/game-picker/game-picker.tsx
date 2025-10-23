import { Link } from "react-router";

export const GamePicker = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="text-center mb-5">
            <h1 className="display-3">🎲 Luck's Run Casino 🎰</h1>
            <p className="lead">Welcome to the finest gambling establishment in the realm!</p>
            <p className="text-muted">Choose your game and test your fortune...</p>
          </div>

          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm hover-shadow">
                <div className="card-header bg-primary text-white">
                  <h3 className="mb-0">Avandra's Favor</h3>
                </div>
                <div className="card-body d-flex flex-column">
                  <div className="text-center mb-3" style={{ fontSize: '64px' }}>
                    🎲
                  </div>
                  <p className="card-text flex-grow-1">
                    A dice game of chance and daring! Roll 2d6 and win on 7 or 12. 
                    Keep rolling to reach exactly 12, but don't bust over!
                  </p>
                  <div className="mt-auto">
                    <p className="text-muted small mb-2">
                      <strong>Minimum Bet:</strong> 25 gp
                    </p>
                    <Link to="/avandras-favor" className="btn btn-primary w-100">
                      Play Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm hover-shadow">
                <div className="card-header bg-danger text-white">
                  <h3 className="mb-0">Gambit of Ord</h3>
                </div>
                <div className="card-body d-flex flex-column">
                  <div className="text-center mb-3" style={{ fontSize: '64px' }}>
                    🃏
                  </div>
                  <p className="card-text flex-grow-1">
                    A strategic card game! Draw three cards and compete against other players. 
                    Raise, stand pat, or fold. Highest hand takes the pot!
                  </p>
                  <div className="mt-auto">
                    <p className="text-muted small mb-2">
                      <strong>Initial Bet:</strong> 50 gp
                    </p>
                    <Link to="/gambit-of-ord" className="btn btn-danger w-100">
                      Play Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm hover-shadow">
                <div className="card-header bg-success text-white">
                  <h3 className="mb-0">Quon a Drensal</h3>
                </div>
                <div className="card-body d-flex flex-column">
                  <div className="text-center mb-3" style={{ fontSize: '64px' }}>
                    🦎
                  </div>
                  <p className="card-text flex-grow-1">
                    The legendary lizard race! Bet on your favorite racer and watch them compete. 
                    Winners get double, second place gets half back.
                  </p>
                  <div className="mt-auto">
                    <p className="text-muted small mb-2">
                      <strong>Minimum Bet:</strong> 10 gp
                    </p>
                    <Link to="/quon-a-drensal" className="btn btn-success w-100">
                      Play Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="alert alert-warning mt-5" role="alert">
            <h5 className="alert-heading">House Rules</h5>
            <ul className="mb-0">
              <li>All players start with 1,000 gold pieces</li>
              <li>The house always wins... eventually</li>
              <li>May the gods of fortune smile upon you!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
