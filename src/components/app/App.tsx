import { Route, Routes } from "react-router";
import { NavBar } from "../nav-bar";
import { AvandrasFavor } from "../avandras-favor";
import { GambitOfOrd } from "../gambit-of-ord";
import { QuonADrensal } from "../quon-a-drensal";
import { GamePicker } from "../game-picker";

export function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/avandras-favor" element={<AvandrasFavor />} />
        <Route path="/gambit-of-ord" element={<GambitOfOrd />} />
        <Route path="/quon-a-drensal" element={<QuonADrensal />} />
        <Route path="*" element={<GamePicker />} />
      </Routes>
    </>
  );
}
