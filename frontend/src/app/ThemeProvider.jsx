import { useEffect} from "react";

import { useSelector } from "react-redux";
import { selectTheme } from "../state-management/theme";


function ThemeProvider({ children }) {
    const theme = useSelector(selectTheme);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    return children;
}

export default ThemeProvider;