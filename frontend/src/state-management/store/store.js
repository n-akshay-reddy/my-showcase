import { configureStore } from "@reduxjs/toolkit";

// import leetcodeReducer from "../leetcode/leetcodeSlice";
import SreeviReducer from "../Sreevi/SreeviSlice";
import navBarReducer from "../NavBar/navBarSlice"
import themeReducer from "../theme/themeSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    // leetcode: leetcodeReducer,
    sreevi: SreeviReducer,
    navBar:navBarReducer,
  },
});

