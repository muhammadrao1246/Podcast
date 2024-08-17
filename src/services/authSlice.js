import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  access_token: null,
  refresh_token: null,
}

const authSlice = createSlice({
  name: 'auth_token_slice',
  initialState,
  reducers: {
    setToken: (state, action) =>{
      state = action.payload
    },
    unsetToken: (state, action) => {
      state = initialState
    }
  }
})

export const { setToken, unsetToken } = authSlice
export default authSlice.reducer
