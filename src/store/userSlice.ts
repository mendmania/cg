// src/store/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  id: string;
  name: string;
  coins: number;
}

const initialState: UserState = {
  id: "user-1",
  name: "Mendim Arifaj",
  coins: 2000, // initial balance; you can load this from an API later
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Action to set the entire user (if you ever fetch from /api/user)
    setUser(state, action: PayloadAction<UserState>) {
      return action.payload;
    },
    // Action to decrement coins by a given amount
    spendCoins(state, action: PayloadAction<number>) {
      state.coins -= action.payload;
      if (state.coins < 0) state.coins = 0;
    },
    // (Optional) Action to add coins
    addCoins(state, action: PayloadAction<number>) {
      state.coins += action.payload;
    },
  },
});

export const { setUser, spendCoins, addCoins } = userSlice.actions;
export default userSlice.reducer;
