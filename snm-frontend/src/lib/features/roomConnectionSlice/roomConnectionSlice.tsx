import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const roomConnectionSlice = createSlice({
    name: 'roomConnection',
    initialState: {value: null as WebSocket | null},
    reducers: {
        setWebsocket: (state, action: PayloadAction<{username: string, roomCode: string | null}>) => {
            state.value = new WebSocket(`ws://localhost:5206/api/ws?username=${action.payload.username}${action.payload.roomCode ? `&room=${action.payload.roomCode}` : null}`);
        },
        closeWebsocket: (state) => {
            state.value.close();
            state.value = null;
        }
    }
});

export const { setWebsocket, closeWebsocket } = roomConnectionSlice.actions;
export default roomConnectionSlice.reducer;