import { configureStore } from '@reduxjs/toolkit'

// import des slices
import profileSlice from './features/profileSlice'
import alertSlice from './features/alertSlice'

export default configureStore({
  reducer: {
    profile: profileSlice,
    alert: alertSlice
  },
})