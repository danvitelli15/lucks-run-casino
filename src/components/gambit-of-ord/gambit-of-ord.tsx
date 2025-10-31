import { useState } from "react";
import { roll } from "../../domain/dice";
import { D4, D6, D8 } from "../../domain/dice/dice.types";

type Player = {
  name: string;
  rolls: number[];
  total: number;
  bet: number;
  folded: boolean;
  isHuman: boolean;
};

export const GambitOfOrd = () => {
  const INITIAL_BET = 50;
  const [gold, setGold] = useState(1000);
  const [pot, setPot] = useState(0);
  const [round, setRound] = useState(0); // 0 = not started, 1 = after d8, 2 = after d6, 3 = after d4
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<"idle" | "betting" | "reveal" | "complete">("idle");
  const [message, setMessage] = useState("");
  const [raiseAmount, setRaiseAmount] = useState(25);
  const [roundLog, setRoundLog] = useState<string[]>([]);
  const [waitingForHuman, setWaitingForHuman] = useState(false);

  const startGame = () => {
    if (gold < INITIAL_BET) {
      setMessage("Not enough gold!");
      return;
    }

    // Initialize players
    const initialPlayers: Player[] = [
      { name: "You", rolls: [], total: 0, bet: INITIAL_BET, folded: false, isHuman: true },
      { name: "Opponent 1", rolls: [], total: 0, bet: INITIAL_BET, folded: false, isHuman: false },
      { name: "Opponent 2", rolls: [], total: 0, bet: INITIAL_BET, folded: false, isHuman: false },
      { name: "Opponent 3", rolls: [], total: 0, bet: INITIAL_BET, folded: false, isHuman: false },
    ];
    
    const initialPot = INITIAL_BET * 4;
    
    setGold(gold - INITIAL_BET);
    setPot(initialPot);
    setPlayers(initialPlayers);
    setRound(1);
    setGameState("betting");
    setRoundLog([]);
    setMessage("First draw! Each player draws one card (d8).");
    setWaitingForHuman(false);
    
    // Draw first card
    setTimeout(() => drawCard(D8, initialPlayers), 500);
  };

  const drawCard = (die: typeof D4 | typeof D6 | typeof D8, currentPlayers: Player[]) => {
    const newLog: string[] = [];
    
    const updatedPlayers = currentPlayers.map(player => {
      if (player.folded) return player;
      
      const playerRoll = roll(1, die)[0];
      const newRolls = [...player.rolls, playerRoll];
      const newTotal = newRolls.reduce((sum, r) => sum + r, 0);
      
      newLog.push(`${player.name} drew ${playerRoll}`);
      
      return {
        ...player,
        rolls: newRolls,
        total: newTotal,
      };
    });

    setPlayers(updatedPlayers);
    setRoundLog(prev => [...prev, ...newLog]);
    setWaitingForHuman(true);
  };

  const getMaxPossibleForRound = (currentRound: number): number => {
    // Round 1: d8 = 8, Round 2: d6 = 6, Round 3: d4 = 4
    if (currentRound === 1) return 8;
    if (currentRound === 2) return 6;
    if (currentRound === 3) return 4;
    return 6;
  };

  const shouldAIRaise = (player: Player, currentRound: number): boolean => {
    if (player.folded) return false;
    
    const lastRoll = player.rolls[player.rolls.length - 1];
    const maxPossible = getMaxPossibleForRound(currentRound);
    const randomThreshold = Math.floor(Math.random() * maxPossible) + 1;
    
    // If last roll is >= threshold, they raise
    return lastRoll >= randomThreshold;
  };

  const getAIRaiseAmount = (baseBet: number): number => {
    const min = 5;
    const max = baseBet * 3;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const handleHumanRaise = () => {
    if (gold < raiseAmount) {
      setMessage("Not enough gold to raise!");
      return;
    }
    
    setGold(gold - raiseAmount);
    setPot(pot + raiseAmount);
    
    const updatedPlayers = players.map(player => {
      if (player.isHuman) {
        return { ...player, bet: player.bet + raiseAmount };
      }
      return player;
    });
    
    setPlayers(updatedPlayers);
    setRoundLog(prev => [...prev, `You raised ${raiseAmount} gp`]);
    setWaitingForHuman(false);
    
    // Process AI decisions
    setTimeout(() => processAIDecisions(updatedPlayers), 800);
  };

  const handleHumanStandPat = () => {
    setRoundLog(prev => [...prev, "You stand pat"]);
    setWaitingForHuman(false);
    
    // Process AI decisions
    setTimeout(() => processAIDecisions(players), 800);
  };

  const handleHumanFold = () => {
    const updatedPlayers = players.map(player => {
      if (player.isHuman) {
        return { ...player, folded: true };
      }
      return player;
    });
    
    setPlayers(updatedPlayers);
    setRoundLog(prev => [...prev, "You folded"]);
    setWaitingForHuman(false);
    
    // Check if only one player remains
    const activePlayers = updatedPlayers.filter(p => !p.folded);
    if (activePlayers.length === 1) {
      finishGame(updatedPlayers);
      return;
    }
    
    // Continue with AI
    setTimeout(() => processAIDecisions(updatedPlayers), 800);
  };

  const processAIDecisions = (currentPlayers: Player[]) => {
    const newLog: string[] = [];
    let currentPot = pot;
    
    const updatedPlayers = currentPlayers.map(player => {
      if (player.folded || player.isHuman) return player;
      
      if (shouldAIRaise(player, round)) {
        const raise = getAIRaiseAmount(INITIAL_BET);
        currentPot += raise;
        newLog.push(`${player.name} raised ${raise} gp`);
        return { ...player, bet: player.bet + raise };
      } else {
        // AI decides to fold or stand based on their hand strength
        const shouldFold = Math.random() < 0.25; // 25% chance to fold if not raising
        if (shouldFold) {
          newLog.push(`${player.name} folded`);
          return { ...player, folded: true };
        } else {
          newLog.push(`${player.name} stands pat`);
          return player;
        }
      }
    });

    setPot(currentPot);
    setPlayers(updatedPlayers);
    setRoundLog(prev => [...prev, ...newLog]);
    
    // Check if only one player remains
    const activePlayers = updatedPlayers.filter(p => !p.folded);
    if (activePlayers.length === 1) {
      setTimeout(() => finishGame(updatedPlayers), 1000);
      return;
    }
    
    // Check if human folded
    const humanPlayer = updatedPlayers.find(p => p.isHuman);
    if (humanPlayer?.folded) {
      // Continue game without human
      setTimeout(() => advanceToNextRound(updatedPlayers), 1000);
      return;
    }
    
    // Advance to next round
    setTimeout(() => advanceToNextRound(updatedPlayers), 1000);
  };

  const advanceToNextRound = (currentPlayers: Player[]) => {
    if (round === 1) {
      setRound(2);
      setMessage("Second draw! Each player draws another card (d6).");
      setTimeout(() => drawCard(D6, currentPlayers), 500);
    } else if (round === 2) {
      setRound(3);
      setMessage("Third draw! Each player draws the final card (d4).");
      setTimeout(() => drawCard(D4, currentPlayers), 500);
    } else if (round === 3) {
      // Reveal and determine winner
      setGameState("reveal");
      setTimeout(() => determineWinner(currentPlayers), 1000);
    }
  };

  const determineWinner = (finalPlayers: Player[]) => {
    const activePlayers = finalPlayers.filter(p => !p.folded);
    
    if (activePlayers.length === 1) {
      const winner = activePlayers[0];
      if (winner.isHuman) {
        setGold(gold + pot);
        setMessage(`Everyone else folded! You win the pot of ${pot} gp!`);
      } else {
        setMessage(`${winner.name} wins! Everyone else folded. You lose ${finalPlayers.find(p => p.isHuman)?.bet || INITIAL_BET} gp.`);
      }
      setGameState("complete");
      return;
    }

    const maxTotal = Math.max(...activePlayers.map(p => p.total));
    const winners = activePlayers.filter(p => p.total === maxTotal);
    
    if (winners.length === 1) {
      const winner = winners[0];
      if (winner.isHuman) {
        setGold(gold + pot);
        setMessage(`You win with a total of ${winner.total}! You win ${pot} gp!`);
      } else {
        const humanBet = finalPlayers.find(p => p.isHuman)?.bet || INITIAL_BET;
        setMessage(`${winner.name} wins with a total of ${winner.total}. You lose ${humanBet} gp.`);
      }
    } else {
      const share = Math.floor(pot / winners.length);
      if (winners.some(w => w.isHuman)) {
        setGold(gold + share);
        setMessage(`Tie at ${maxTotal}! You split the pot and win ${share} gp.`);
      } else {
        const humanBet = finalPlayers.find(p => p.isHuman)?.bet || INITIAL_BET;
        setMessage(`${winners.map(w => w.name).join(" and ")} tie at ${maxTotal} and split the pot. You lose ${humanBet} gp.`);
      }
    }
    
    setGameState("complete");
  };

  const finishGame = (finalPlayers: Player[]) => {
    setGameState("complete");
    determineWinner(finalPlayers);
  };

  const reset = () => {
    setRound(0);
    setPlayers([]);
    setPot(0);
    setGameState("idle");
    setMessage("");
    setRoundLog([]);
    setWaitingForHuman(false);
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

              {(gameState === "betting" || gameState === "reveal" || gameState === "complete") && (
                <div>
                  <div className="mb-4">
                    <h5>Round {round} of 3</h5>
                    <div className="row">
                      {players.map((player, idx) => (
                        <div key={idx} className="col-md-6 mb-3">
                          <div className={`card ${player.isHuman ? 'border-primary border-2' : ''} ${player.folded ? 'bg-secondary-subtle' : ''}`}>
                            <div className="card-body">
                              <h6>
                                {player.name}
                                {player.isHuman && <span className="badge bg-primary ms-2">You</span>}
                              </h6>
                              {player.folded ? (
                                <p className="text-muted">Folded</p>
                              ) : (
                                <>
                                  {(gameState === "reveal" || gameState === "complete") ? (
                                    <>
                                      <p className="mb-1"><strong>Rolls:</strong> {player.rolls.join(", ")}</p>
                                      <p className="mb-1"><strong>Total:</strong> {player.total}</p>
                                    </>
                                  ) : (
                                    <>
                                      {player.isHuman ? (
                                        <>
                                          <p className="mb-1"><strong>Your Rolls:</strong> {player.rolls.join(", ")}</p>
                                          <p className="mb-1"><strong>Your Total:</strong> {player.total}</p>
                                        </>
                                      ) : (
                                        <p className="mb-1"><strong>Cards:</strong> {player.rolls.length} drawn</p>
                                      )}
                                    </>
                                  )}
                                  <p className="mb-0"><strong>Bet:</strong> {player.bet} gp</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {gameState === "betting" && waitingForHuman && !players.find(p => p.isHuman)?.folded && (
                    <div className="mb-3">
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

                      <button className="btn btn-warning me-2" onClick={handleHumanRaise}>
                        Raise
                      </button>
                      <button className="btn btn-primary me-2" onClick={handleHumanStandPat}>
                        Stand Pat
                      </button>
                      <button className="btn btn-secondary" onClick={handleHumanFold}>
                        Fold
                      </button>
                    </div>
                  )}

                  {gameState === "complete" && (
                    <button className="btn btn-primary mt-3" onClick={reset}>
                      Play Again
                    </button>
                  )}

                  {roundLog.length > 0 && (
                    <div className="card mt-3">
                      <div className="card-header">
                        <h6 className="mb-0">Game Log</h6>
                      </div>
                      <div className="card-body" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {roundLog.map((log, idx) => (
                          <div key={idx} className="small text-muted">{log}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {message && (
                <div className={`alert mt-3 ${message.includes("win") || message.includes("Win") ? "alert-success" : "alert-info"}`}>
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
