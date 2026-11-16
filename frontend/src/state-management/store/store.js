import { configureStore } from "@reduxjs/toolkit";

import leetcodeReducer from "../leetcode/leetcodeSlice";
import experienceReducer from "../experience/experienceSlice";
import SreeviReducer from "../Sreevi/SreeviSlice";
import navBarReducer from "../NavBar/navBarSlice"
import themeReducer from "../theme/themeSlice";
import educationReducer from "../Education/educationSlice";
import moreReducer from "../More/moreSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    leetcode: leetcodeReducer,
    education: educationReducer,
    experience: experienceReducer,
    sreevi: SreeviReducer,
    navBar:navBarReducer,
    more: moreReducer
  },
});

