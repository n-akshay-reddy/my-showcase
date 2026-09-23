import {useDispatch} from "react-redux";
import {toggleTheme} from "./state-management/theme";

function App() {
  const dispatch = useDispatch();

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <div><button onClick={handleThemeToggle}>Toggle Theme</button>
      <h1>My Showcase</h1>
      <p>First version of my personal portfolio. More to come.</p>
    </div>
    
  );
}

export default App;