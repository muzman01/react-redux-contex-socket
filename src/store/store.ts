// redux
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// services

// reducers
import messageSlice from "./message/messageSlice";
import notificationSlice from "./notification/notificationSlice";

export const store = configureStore({
  reducer: {
    message: messageSlice,
    notification: notificationSlice,
  },
});

setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type RootState = ReturnType<typeof store.getState>;
