import { configureStore } from "@reduxjs/toolkit";

import leetcodeReducer from "../leetcode/leetcodeSlice";
import experienceReducer from "../Experience/experienceSlice";
import SreeviReducer from "../Sreevi/SreeviSlice";
import navBarReducer from "../NavBar/navBarSlice"
import themeReducer from "../Theme/themeSlice";
import educationReducer from "../Education/educationSlice";
import moreReducer from "../More/moreSlice";
import openSourceReducer from "../OpenSource/openSourceSlice";
import achievementsReducer from "../Achievements/achievementsSlice";
import projectsReducer from "../Projects/ProjectsSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    leetcode: leetcodeReducer,
    education: educationReducer,
    experience: experienceReducer,
    sreevi: SreeviReducer,
    navBar:navBarReducer,
    more: moreReducer,
    openSource: openSourceReducer,
    achievements: achievementsReducer,
    projects: projectsReducer,
  },
});

