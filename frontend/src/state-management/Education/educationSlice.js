import { createSlice } from "@reduxjs/toolkit";


const educationData = [
  {
    "id": "edu-school",
    "mono": "KV",
    "accent": ["#38bdf8", "#6366f1"],
    "level": "Schooling",
    "degree": "High School",
    "board": "CBSE",
    "institution": "Kendriya Vidyalaya No. 2, Uppal",
    "location": "Hyderabad, Telangana, India",
    "startYear": 2009,
    "endYear": 2019,
    "status": "Completed",
    "grade": { "type": "Percentage", "value": 84.83 }
  },
  {
    "id": "edu-intermediate",
    "mono": "UJC",
    "accent": ["#fb923c", "#ec4899"],
    "level": "Intermediate",
    "degree": "Intermediate (MPC)",
    "board": "TSBIE",
    "institution": "Urbane Junior College",
    "location": "Hyderabad, Telangana, India",
    "startYear": 2019,
    "endYear": 2021,
    "status": "Completed",
    "grade": { "type": "Percentage", "value": 91.2 }
  },
  {
    "id": "edu-btech",
    "mono": "CMR",
    "accent": ["#a855f7", "#ec4899"],
    "level": "Undergraduate",
    "degree": "Bachelor of Engineering (CSE)",
    "institution": "CMR Engineering College",
    "location": "Hyderabad, Telangana, India",
    "startYear": 2021,
    "endYear": 2025,
    "status": "Completed",
    "grade": { "type": "CGPA", "value": 8.18, "scale": 10 }
  }
]

const educationSlice = createSlice({
    name: "education",
    initialState: { data: educationData },
    reducers: {},
});

export default educationSlice.reducer;