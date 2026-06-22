import { configureStore } from "@reduxjs/toolkit";
import usernameReducer from "./features/username/usernameSlice";

export function makeStore()
{
    return configureStore({
        reducer: {
            username: usernameReducer
        }
    });
}

export type AppStore = ReturnType<typeof makeStore>

export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']