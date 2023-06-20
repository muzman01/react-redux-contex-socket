import { createSlice } from "@reduxjs/toolkit";

// types
import type { PayloadAction } from "@reduxjs/toolkit";

interface Notification {
  type: string;
  read: boolean;
  message: string;
}

const initialState: Notification = {
  type: "",
  read: false,
  message: "",
};

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
    setRead: (state, action: PayloadAction<boolean>) => {
      state.read = action.payload;
    },
    setMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
  },
});

export const { setMessage, setRead, setType } = notificationSlice.actions;
export default notificationSlice.reducer;
