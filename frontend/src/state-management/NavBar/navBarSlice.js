import { createSlice } from "@reduxjs/toolkit";

const initialState = [
  { label: "Home", to: "/" },
  { label: "<Leetcode/>", to: "/leetcode" },
  {
    label: "About",
    paths: ["/about"],
    children: [
      { to: "/about/education", label: "Education" },
      { to: "/about/skills", label: "Skills" },
    ],
  },
  {
    label: "Showcase",
    paths: ["/showcase"],
    children: [
      { to: "/showcase/projects", label: "Projects" },
      { to: "/showcase/work", label: "Work" },
      { to: "/showcase/achievements", label: "Achievements" },
    ],
  },
  {
    label: "More",
    paths: ["/more"],
    children: [
      { to: "/more/interests", label: "Interests" },
      { to: "/more/hobbies", label: "Hobbies" },
      { to: "/more/contact", label: "Contact" },
    ],
  },
];

const navBarSlice = createSlice({
    name: "navBar",
    initialState,
    reducers: {},
})  

export default navBarSlice.reducer;
