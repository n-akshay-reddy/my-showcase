import { configureStore } from "@reduxjs/toolkit";

// import leetcodeReducer from "../leetcode/leetcodeSlice";
// import serviReducer from "../servi/serviSlice";
import navBarReducer from "../NavBar/navBarSlice"
import themeReducer from "../theme/themeSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    // leetcode: leetcodeReducer,
    // servi: serviReducer,
    navBar:navBarReducer,
  },
});

