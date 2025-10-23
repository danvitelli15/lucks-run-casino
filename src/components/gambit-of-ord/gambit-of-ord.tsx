import { useState } from "react";
import { roll } from "../../domain/dice";
import { D4, D6, D8 } from "../../domain/dice/dice.types";

type Player = {
  name: string;
  rolls: number[];
  total: number;
  bet: number;
  folded: boolean;
};

export const GambitOfOrd = () => {
  const INITIAL_BET = 50;
  const [gold, setGold] = useState(1000);
  const [pot, setPot] = useState(0);
  const [round, setRound] = useState(0); // 0 = not started, 1 = after d8, 2 = after d6, 3 = after d4
  const [player, setPlayer] = useState<Player>({
    name: "You",
    rolls: [],
    total: 0,
    bet: 0,
    folded: false,
  });
  const [opponents, setOpponents] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<"idle" | "betting" | "reveal" | "complete">("idle");
  const [message, setMessage] = useState("");
  const [raiseAmount, setRaiseAmount] = useState(25);

  const startGame = () => {
    if (gold < INITIAL_BET) {
      setMessage("Not enough gold!");
      return;
    }

    // Initialize players
    const numOpponents = 2;
    const initialPot = INITIAL_BET * (numOpponents + 1);
    
    setGold(gold - INITIAL_BET);
    setPot(initialPot);
    setPlayer({
      name: "You",
      rolls: [],
      total: 0,
      bet: INITIAL_BET,
      folded: false,
    });
    
    const newOpponents: Player[] = [];
    for (let i = 0; i < numOpponents; i++) {
      newOpponents.push({
        name: `Opponent ${i + 1}`,
        rolls: [],
        total: 0,
        bet: INITIAL_BET,
        folded: false,
      });
    }
    setOpponents(newOpponents);
    setRound(1);
    setGameState("betting");
    setMessage("First draw! Each player draws one card (d8).");
    
    // Draw first card
    setTimeout(() => drawCard(D8), 500);
  };

  const drawCard = (die: typeof D4 | typeof D6 | typeof D8) => {
    const playerRoll = roll(1, die)[0];
    const newPlayerRolls = [...player.rolls, playerRoll];
    const newPlayerTotal = newPlayerRolls.reduce((sum, r) => sum + r, 0);
    
    setPlayer({
      ...player,
      rolls: newPlayerRolls,
      total: newPlayerTotal,
    });

    const newOpponents = opponents.map(opp => {
      if (opp.folded) return opp;
      const oppRoll = roll(1, die)[0];
      const newRolls = [...opp.rolls, oppRoll];
      return {
        ...opp,
        rolls: newRolls,
        total: newRolls.reduce((sum, r) => sum + r, 0),
      };
    });
    setOpponents(newOpponents);
  };

  const handleRaise = () => {
    if (gold < raiseAmount) {
      setMessage("Not enough gold to raise!");
      return;
    }
    
    setGold(gold - raiseAmount);
    setPot(pot + raiseAmount);
    setPlayer({ ...player, bet: player.bet + raiseAmount });
    
    // Opponents decide whether to call or fold
    const newOpponents = opponents.map(opp => {
      if (opp.folded) return opp;
      
      // Simple AI: fold if total is low, call if decent
      const shouldFold = Math.random() < 0.3 || opp.total < 5;
      if (shouldFold) {
        return { ...opp, folded: true };
      } else {
        setPot(prevPot => prevPot + raiseAmount);
        return { ...opp, bet: opp.bet + raiseAmount };
      }
    });
    setOpponents(newOpponents);
    
    advanceRound();
  };

  const handleStandPat = () => {
    advanceRound();
  };

  const handleFold = () => {
    setPlayer({ ...player, folded: true });
    setGameState("complete");
    setMessage(`You folded. You lose ${player.bet} gp.`);
  };

  const advanceRound = () => {
    if (round === 1) {
      setRound(2);
      setMessage("Second draw! Each player draws another card (d6).");
      setTimeout(() => drawCard(D6), 500);
    } else if (round === 2) {
      setRound(3);
      setMessage("Third draw! Each player draws the final card (d4).");
      setTimeout(() => drawCard(D4), 500);
    } else if (round === 3) {
      // Reveal and determine winner
      setGameState("reveal");
      determineWinner();
    }
  };

  const determineWinner = () => {
    const activePlayers = [player, ...opponents].filter(p => !p.folded);
    
    if (activePlayers.length === 1) {
      if (activePlayers[0].name === "You") {
        setGold(gold + pot);
        setMessage(`Everyone else folded! You win the pot of ${pot} gp!`);
      } else {
        setMessage(`${activePlayers[0].name} wins the pot of ${pot} gp.`);
      }
      setGameState("complete");
      return;
    }

    const maxTotal = Math.max(...activePlayers.map(p => p.total));
    const winners = activePlayers.filter(p => p.total === maxTotal);
    
    if (winners.length === 1) {
      const winner = winners[0];
      if (winner.name === "You") {
        setGold(gold + pot);
        setMessage(`You win with a total of ${winner.total}! You win ${pot} gp!`);
      } else {
        setMessage(`${winner.name} wins with a total of ${winner.total}. You lose ${player.bet} gp.`);
      }
    } else {
      const share = Math.floor(pot / winners.length);
      if (winners.some(w => w.name === "You")) {
        setGold(gold + share);
        setMessage(`Tie at ${maxTotal}! You split the pot and win ${share} gp.`);
      } else {
        setMessage(`${winners.map(w => w.name).join(" and ")} tie at ${maxTotal} and split the pot.`);
      }
    }
    
    setGameState("complete");
  };

  const reset = () => {
    setRound(0);
    setPlayer({ name: "You", rolls: [], total: 0, bet: 0, folded: false });
    setOpponents([]);
    setPot(0);
    setGameState("idle");
    setMessage("");
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow">
            <div className="card-header bg-danger text-white">
              <h2 className="mb-0">Gambit of Ord</h2>
            </div>
            <div className="card-body">
              <p className="lead">
                A card game of chance and bluffing. Draw 3 cards (d8, d6, d4) and highest total wins!
              </p>
              
              <div className="mb-3">
                <h4>Gold: {gold} gp</h4>
                <h4>Pot: {pot} gp</h4>
              </div>

              {gameState === "idle" && (
                <div>
                  <button className="btn btn-success btn-lg" onClick={startGame}>
                    Join Game (50 gp)
                  </button>
                </div>
              )}

              {gameState === "betting" && (
                <div>
                  <div className="mb-4">
                    <h5>Round {round} of 3</h5>
                    <div className="card mb-3">
                      <div className="card-body">
                        <h6>Your Hand:</h6>
                        <p>Rolls: {player.rolls.join(", ")} | Total: {player.total}</p>
                      </div>
                    </div>
                    
                    {opponents.map((opp, idx) => (
                      <div key={idx} className="card mb-2">
                        <div className="card-body">
                          <h6>{opp.name}:</h6>
                          <p>{opp.folded ? "Folded" : `Still in (${opp.rolls.length} cards drawn)`}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Raise Amount:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={raiseAmount}
                      onChange={(e) => setRaiseAmount(Math.max(1, parseInt(e.target.value) || 25))}
                      min={1}
                    />
                  </div>

                  <button className="btn btn-warning me-2" onClick={handleRaise}>
                    Raise
                  </button>
                  <button className="btn btn-primary me-2" onClick={handleStandPat}>
                    Stand Pat
                  </button>
                  <button className="btn btn-secondary" onClick={handleFold}>
                    Fold
                  </button>
                </div>
              )}

              {gameState === "reveal" || gameState === "complete" ? (
                <div>
                  <h5>Final Hands:</h5>
                  <div className="card mb-3 border-primary">
                    <div className="card-body">
                      <h6>Your Hand:</h6>
                      <p>Rolls: {player.rolls.join(", ")} | Total: {player.total}</p>
                      {player.folded && <span className="badge bg-secondary">Folded</span>}
                    </div>
                  </div>
                  
                  {opponents.map((opp, idx) => (
                    <div key={idx} className="card mb-2">
                      <div className="card-body">
                        <h6>{opp.name}:</h6>
                        <p>
                          {opp.folded 
                            ? "Folded" 
                            : `Rolls: ${opp.rolls.join(", ")} | Total: ${opp.total}`
                          }
                        </p>
                      </div>
                    </div>
                  ))}

                  <button className="btn btn-primary mt-3" onClick={reset}>
                    Play Again
                  </button>
                </div>
              ) : null}

              {message && (
                <div className={`alert mt-3 ${gameState === "complete" && message.includes("win") ? "alert-success" : "alert-info"}`}>
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
