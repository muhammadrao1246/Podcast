import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  email: "",
  full_name: "",
  profile_image: null,
}

export const userSlice = createSlice({
  name: 'user_info',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.email = action.payload.email
      state.full_name = action.payload.full_name
      state.profile_image = action.payload.profile_image ?? "public/images/user.png"
    },
    unsetUserInfo: (state, action) => {
      state = initialState
    },
  }
})

console.log(userSlice)

export const { setUserInfo, unsetUserInfo } = userSlice.actions

export default userSlice.reducer