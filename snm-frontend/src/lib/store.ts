import { configureStore } from "@reduxjs/toolkit";
import usernameReducer from "./features/username/usernameSlice";
import roomConnectionReducer from "./features/roomConnectionSlice/roomConnectionSlice";

export function makeStore()
{
    return configureStore({
        reducer: {
            username: usernameReducer,
            roomConnection: roomConnectionReducer
        }
    });
}

export type AppStore = ReturnType<typeof makeStore>

export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']