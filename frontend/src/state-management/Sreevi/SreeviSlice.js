import { createSlice } from "@reduxjs/toolkit";

export const SREEVI_STATUS = Object.freeze({
  IDLE: "idle",
  WORKING: "working",
  RESULT: "result"
});

const initialState = {
  isOpen: false, 
  status: SREEVI_STATUS.IDLE,
  unreadCount: 0,
  notice: null, 
};

const sreeviSlice = createSlice({
  name: "sreevi",
  initialState,
  reducers: {
    openChat(state) {
      state.isOpen = true;
      state.unreadCount = 0;
      state.notice = null;
      if (state.status === SREEVI_STATUS.RESULT) state.status = SREEVI_STATUS.IDLE;
    },
    closeChat(state) {
      state.isOpen = false;
    },
    toggleChat(state) {
      sreeviSlice.caseReducers[state.isOpen ? "closeChat" : "openChat"](state);
    },
    startWorking(state, action) {
      state.status = SREEVI_STATUS.WORKING;
      state.notice = action.payload ?? null;
    },

    messageReceived(state, action) {
      state.notice = action.payload ?? null;
      if (state.isOpen) {
        state.status = SREEVI_STATUS.IDLE;
        state.notice = null;
        return;
      }
      state.status = SREEVI_STATUS.RESULT;
      state.unreadCount += 1;
    },
    setIdle(state) {
      state.status = SREEVI_STATUS.IDLE;
      state.notice = null;
    },
  },
});

export const { openChat, closeChat, toggleChat, startWorking, messageReceived, setIdle } = sreeviSlice.actions;
export const selectSreevi = (state) => state.sreevi;

export default sreeviSlice.reducer;