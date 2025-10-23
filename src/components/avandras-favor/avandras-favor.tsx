import { useState } from "react";
import { roll } from "../../domain/dice";
import { D6 } from "../../domain/dice/dice.types";

export const AvandrasFavor = () => {
  const MIN_BET = 25;
  const [bet, setBet] = useState(MIN_BET);
  const [currentBet, setCurrentBet] = useState(MIN_BET);
  const [gold, setGold] = useState(1000);
  const [rolls, setRolls] = useState<number[]>([]);
  const [total, setTotal] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "won" | "bust">("idle");
  const [message, setMessage] = useState("");

  const startGame = () => {
    if (gold < bet) {
      setMessage("Not enough gold!");
      return;
    }
    
    setGold(gold - bet);
    setCurrentBet(bet);
    const initialRolls = roll(2, D6);
    const initialTotal = initialRolls.reduce((sum, r) => sum + r, 0);
    setRolls(initialRolls);
    setTotal(initialTotal);
    
    if (initialTotal === 7 || initialTotal === 12) {
      setGameState("won");
      const winnings = bet * 2;
      setGold(gold - bet + winnings);
      setMessage(`You rolled ${initialTotal}! You win ${winnings} gp!`);
    } else {
      setGameState("playing");
      setMessage(`You rolled ${initialTotal}. Roll another die for 25 gp or stand pat.`);
    }
  };

  const rollAgain = () => {
    if (gold < 25) {
      setMessage("Not enough gold to roll again!");
      return;
    }
    
    setGold(gold - 25);
    setCurrentBet(currentBet + 25);
    const newRoll = roll(1, D6);
    const newRolls = [...rolls, ...newRoll];
    const newTotal = newRolls.reduce((sum, r) => sum + r, 0);
    setRolls(newRolls);
    setTotal(newTotal);
    
    if (newTotal > 12) {
      setGameState("bust");
      setMessage(`You rolled ${newRoll[0]} for a total of ${newTotal}. Bust! You lose ${currentBet + 25} gp.`);
    } else if (newTotal === 12) {
      setGameState("won");
      const winnings = (currentBet + 25) * 2;
      setGold(gold - 25 + winnings);
      setMessage(`You rolled ${newRoll[0]} for a total of 12! You win ${winnings} gp!`);
    } else {
      setMessage(`You rolled ${newRoll[0]} for a total of ${newTotal}. Roll again or stand pat.`);
    }
  };

  const standPat = () => {
    setGameState("bust");
    setMessage(`You stood at ${total}. You lose ${currentBet} gp.`);
  };

  const reset = () => {
    setRolls([]);
    setTotal(0);
    setGameState("idle");
    setMessage("");
    setCurrentBet(MIN_BET);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">Avandra's Favor</h2>
            </div>
            <div className="card-body">
              <p className="lead">
                Roll 2d6 and win on 7 or 12. Keep rolling for 25 gp more, but don't bust over 12!
              </p>
              
              <div className="mb-3">
                <h4>Gold: {gold} gp</h4>
              </div>

              {gameState === "idle" && (
                <div>
                  <div className="mb-3">
                    <label className="form-label">Bet Amount (minimum 25 gp):</label>
                    <input
                      type="number"
                      className="form-control"
                      value={bet}
                      onChange={(e) => setBet(Math.max(MIN_BET, parseInt(e.target.value) || MIN_BET))}
                      min={MIN_BET}
                      step={25}
                    />
                  </div>
                  <button className="btn btn-success btn-lg" onClick={startGame}>
                    Place Bet & Roll
                  </button>
                </div>
              )}

              {gameState === "playing" && (
                <div>
                  <div className="mb-3">
                    <h5>Current Bet: {currentBet} gp</h5>
                    <h5>Your Rolls: {rolls.join(", ")}</h5>
                    <h4>Total: {total}</h4>
                  </div>
                  <button className="btn btn-warning me-2" onClick={rollAgain}>
                    Roll Another (25 gp)
                  </button>
                  <button className="btn btn-secondary" onClick={standPat}>
                    Stand Pat
                  </button>
                </div>
              )}

              {(gameState === "won" || gameState === "bust") && (
                <div>
                  <div className="mb-3">
                    <h5>Your Rolls: {rolls.join(", ")}</h5>
                    <h4>Total: {total}</h4>
                  </div>
                  <button className="btn btn-primary" onClick={reset}>
                    Play Again
                  </button>
                </div>
              )}

              {message && (
                <div className={`alert mt-3 ${gameState === "won" ? "alert-success" : gameState === "bust" ? "alert-danger" : "alert-info"}`}>
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
