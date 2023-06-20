import { createSlice } from "@reduxjs/toolkit";

// types
import type { PayloadAction } from "@reduxjs/toolkit";

interface Message {
  id: string;
  text: string;
  createdAt: string;
  from: string;
  to: string;
}

const initialState: Message = {
  id: "",
  text: "",
  createdAt: "",
  from: "",
  to: "",
};

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    setText: (state, action: PayloadAction<string>) => {
      state.text = action.payload;
    },
    setCreatedAt: (state, action: PayloadAction<string>) => {
      state.createdAt = action.payload;
    },
    setFrom: (state, action: PayloadAction<string>) => {
      state.to = action.payload;
    },
    setTo: (state, action: PayloadAction<string>) => {
      state.from = action.payload;
    },
  },
});

export const { setId, setText, setCreatedAt, setFrom, setTo } =
  messageSlice.actions;
export default messageSlice.reducer;
