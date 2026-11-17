import { useCallback, useState } from "react";
import { Routes, Route } from "react-router-dom";

import WavyCursor from "./app/components/WavyCursor/WavyCursor";
import QuickNavBar from "./app/components/QuickNavBar/QuickNavBar";
import NavBar from "./app/components/NavBar/NavBar";
import Leetcode from "./pages/leetcode/LeetCode";
import HomePage from "./pages/homePage/HomePage";
import Contact from "./pages/contact/Contact"
import Experience from "./pages/experience/Experience";
import Education from "./pages/education/Education";
import More from "./pages/more/More";
import OpenSource from "./pages/openSource/OpenSource";
import Projects from "./pages/projects/Projects";
import Achievements from "./pages/achievements/Achievements";
import SreeviLauncher from "./app/components/SreeviLauncher/SreeviLauncher";

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
            <Route path="/leetcode" element={<Leetcode />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about/experience" element={<Experience />} />
            <Route path="/about/education" element={<Education />} />
            <Route path="/more" element={<More />} />
            <Route path="/showcase/opensource" element={<OpenSource />} />
            <Route path="/showcase/achievements" element={<Achievements />} />
            <Route path="/showcase/projects" element={<Projects />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
          <QuickNavBar />
        </div>
      )}
      {introDone && <SreeviLauncher />}
    </>
  );
}

export default App;