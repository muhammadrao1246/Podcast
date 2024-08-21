import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  access_token: null,
  refresh_token: null,
}

const authSlice = createSlice({
  name: 'auth_token_slice',
  initialState,
  reducers: {
    setUserToken: (state, action) =>{
      state = action.payload
    },
    unsetUserToken: (state, action) => {
      state = initialState
    }
  }
})

export const { setUserToken, unsetUserToken } = authSlice
export default authSlice.reducer
