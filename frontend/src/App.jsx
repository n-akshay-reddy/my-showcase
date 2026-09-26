import {useDispatch} from "react-redux";
import {toggleTheme} from "./state-management/theme";

import WavyCursor from './app/components/WavyCursor/WavyCursor';
import  QuickNavBar from './app/components/QuickNavBar/QuickNavBar'

function App() {
  const dispatch = useDispatch();

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  async function handleClick(message) {
      const response = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/ai`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ message })
      });

      if (!response.ok) {
          throw new Error("Failed to send message");
      }

      const data = await response.json();
      console.log("AI Response:", data);
  }

  return (
    <>
      <WavyCursor />
      <div><button onClick={handleThemeToggle}>Toggle Theme</button>
        <h1>My Showcase</h1>
        <p>First version of my personal portfolio. More to come.</p>
        <button onClick={() => handleClick("Hello, AI!,can u change the theme")}>Send Message to AI</button>
      </div>
      <QuickNavBar />
    </>
  );
}

export default App;