import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const usernameSlice = createSlice({
    name: 'username',
    initialState: { value: null as string | null},
    reducers: {
        setUsername: (state, action: PayloadAction<string>) => {
            state.value = action.payload;
        }
    }
});

export const { setUsername } = usernameSlice.actions;
export default usernameSlice.reducer;