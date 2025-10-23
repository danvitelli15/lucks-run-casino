import { useState } from "react";
import { roll } from "../../domain/dice";
import { D4 } from "../../domain/dice/dice.types";

type Lizard = {
  name: string;
  color: string;
  rolls: number[];
  total: number;
};

export const QuonADrensal = () => {
  const MIN_BET = 10;
  const [bet, setBet] = useState(MIN_BET);
  const [gold, setGold] = useState(1000);
  const [selectedLizard, setSelectedLizard] = useState<number | null>(null);
  const [lizards, setLizards] = useState<Lizard[]>([
    { name: "Red Runner", color: "danger", rolls: [], total: 0 },
    { name: "Blue Bolt", color: "primary", rolls: [], total: 0 },
    { name: "Green Flash", color: "success", rolls: [], total: 0 },
  ]);
  const [gameState, setGameState] = useState<"idle" | "racing" | "complete">("idle");
  const [message, setMessage] = useState("");
  const [winners, setWinners] = useState<number[]>([]);
  const [secondPlace, setSecondPlace] = useState<number[]>([]);

  const startRace = () => {
    if (selectedLizard === null) {
      setMessage("Please select a lizard to bet on!");
      return;
    }
    if (gold < bet) {
      setMessage("Not enough gold!");
      return;
    }

    setGold(gold - bet);
    setGameState("racing");
    setMessage("The lizards are racing...");

    // Simulate race
    setTimeout(() => {
      const racedLizards = lizards.map(lizard => {
        const rolls = roll(3, D4);
        const total = rolls.reduce((sum, r) => sum + r, 0);
        return { ...lizard, rolls, total };
      });

      setLizards(racedLizards);

      // Determine winners
      const maxTotal = Math.max(...racedLizards.map(l => l.total));
      const winningIndices = racedLizards
        .map((l, idx) => (l.total === maxTotal ? idx : -1))
        .filter(idx => idx !== -1);

      setWinners(winningIndices);

      // Determine second place
      const remainingLizards = racedLizards.filter((_, idx) => !winningIndices.includes(idx));
      if (remainingLizards.length > 0) {
        const secondMax = Math.max(...remainingLizards.map(l => l.total));
        const secondPlaceIndices = racedLizards
          .map((l, idx) => (l.total === secondMax && !winningIndices.includes(idx) ? idx : -1))
          .filter(idx => idx !== -1);
        setSecondPlace(secondPlaceIndices);

        // Calculate winnings
        if (winningIndices.includes(selectedLizard)) {
          const winnings = bet * 2;
          setGold(gold - bet + winnings);
          setMessage(`${racedLizards[selectedLizard].name} wins! You win ${winnings} gp!`);
        } else if (secondPlaceIndices.includes(selectedLizard)) {
          const winnings = Math.floor(bet / 2);
          setGold(gold - bet + winnings);
          setMessage(`${racedLizards[selectedLizard].name} came in second. You get back ${winnings} gp.`);
        } else {
          setMessage(`${racedLizards[selectedLizard].name} lost. You lose ${bet} gp.`);
        }
      } else {
        // All tied or only one winner
        if (winningIndices.includes(selectedLizard)) {
          const winnings = bet * 2;
          setGold(gold - bet + winnings);
          setMessage(`${racedLizards[selectedLizard].name} wins! You win ${winnings} gp!`);
        } else {
          setMessage(`${racedLizards[selectedLizard].name} lost. You lose ${bet} gp.`);
        }
      }

      setGameState("complete");
    }, 1500);
  };

  const reset = () => {
    setLizards([
      { name: "Red Runner", color: "danger", rolls: [], total: 0 },
      { name: "Blue Bolt", color: "primary", rolls: [], total: 0 },
      { name: "Green Flash", color: "success", rolls: [], total: 0 },
    ]);
    setSelectedLizard(null);
    setGameState("idle");
    setMessage("");
    setWinners([]);
    setSecondPlace([]);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h2 className="mb-0">Quon a Drensal (Run of Luck)</h2>
            </div>
            <div className="card-body">
              <p className="lead">
                Bet on a lizard! Winners get double their bet, second place gets half back.
              </p>
              
              <div className="mb-3">
                <h4>Gold: {gold} gp</h4>
              </div>

              {gameState === "idle" && (
                <div>
                  <div className="mb-3">
                    <label className="form-label">Bet Amount (minimum 10 gp):</label>
                    <input
                      type="number"
                      className="form-control"
                      value={bet}
                      onChange={(e) => setBet(Math.max(MIN_BET, parseInt(e.target.value) || MIN_BET))}
                      min={MIN_BET}
                    />
                  </div>

                  <h5 className="mb-3">Select a Lizard:</h5>
                  <div className="row">
                    {lizards.map((lizard, idx) => (
                      <div key={idx} className="col-md-4 mb-3">
                        <div
                          className={`card h-100 ${selectedLizard === idx ? 'border-warning border-3' : ''}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedLizard(idx)}
                        >
                          <div className={`card-header bg-${lizard.color} text-white`}>
                            <h5 className="mb-0">{lizard.name}</h5>
                          </div>
                          <div className="card-body text-center">
                            <div style={{ fontSize: '48px' }}>🦎</div>
                            {selectedLizard === idx && (
                              <span className="badge bg-warning text-dark mt-2">Selected</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    className="btn btn-success btn-lg mt-3" 
                    onClick={startRace}
                    disabled={selectedLizard === null}
                  >
                    Start Race
                  </button>
                </div>
              )}

              {gameState === "racing" && (
                <div className="text-center">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Racing...</span>
                  </div>
                  <p className="mt-3">The lizards are racing!</p>
                </div>
              )}

              {gameState === "complete" && (
                <div>
                  <h5 className="mb-3">Race Results:</h5>
                  <div className="row">
                    {lizards.map((lizard, idx) => (
                      <div key={idx} className="col-md-4 mb-3">
                        <div className={`card h-100 ${winners.includes(idx) ? 'border-warning border-3' : secondPlace.includes(idx) ? 'border-info border-2' : ''}`}>
                          <div className={`card-header bg-${lizard.color} text-white`}>
                            <h5 className="mb-0">{lizard.name}</h5>
                          </div>
                          <div className="card-body">
                            <div style={{ fontSize: '48px', textAlign: 'center' }}>🦎</div>
                            <p><strong>Rolls:</strong> {lizard.rolls.join(", ")}</p>
                            <p><strong>Total:</strong> {lizard.total}</p>
                            {winners.includes(idx) && (
                              <span className="badge bg-warning text-dark">Winner!</span>
                            )}
                            {secondPlace.includes(idx) && (
                              <span className="badge bg-info">2nd Place</span>
                            )}
                            {selectedLizard === idx && (
                              <span className="badge bg-secondary ms-2">Your Bet</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="btn btn-primary mt-3" onClick={reset}>
                    Race Again
                  </button>
                </div>
              )}

              {message && (
                <div className={`alert mt-3 ${message.includes("win") || message.includes("Win") ? "alert-success" : message.includes("lost") || message.includes("lose") ? "alert-danger" : "alert-info"}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
