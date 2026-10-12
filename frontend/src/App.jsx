import { useCallback, useState } from "react";
import { Routes, Route } from "react-router-dom";

import WavyCursor from "./app/components/WavyCursor/WavyCursor";
import QuickNavBar from "./app/components/QuickNavBar/QuickNavBar";
import NavBar from "./app/components/NavBar/NavBar";
// import Leetcode from "./pages/leetcode/LeetCode";
import HomePage from "./pages/homePage/HomePage";
import ComingSoon from "./pages/ComingSoon/ComingSoon";

function App() {
  const [introDone, setIntroDone] = useState(false);
  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  return (
    <>
      <WavyCursor />
      <NavBar onIntroDone={handleIntroDone} />

      {introDone && (
        <div className="page-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* <Route path="/leetcode" element={<Leetcode />} /> */}
            <Route path="*" element={<ComingSoon />} />
          </Routes>
          <QuickNavBar />
        </div>
      )}
    </>
  );
}

export default App;