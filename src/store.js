import { configureStore } from '@reduxjs/toolkit'

// import des slices
import profileSlice from './features/profileSlice'

export default configureStore({
  reducer: {
    profile: profileSlice
  },
})