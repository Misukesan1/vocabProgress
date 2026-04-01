import { configureStore } from '@reduxjs/toolkit'

// import des slices
import profileSlice from './features/profileSlice'
import alertSlice from './features/alertSlice'
import ficheSlice from './features/ficheSlice'

export default configureStore({
  reducer: {
    profile: profileSlice,
    alert: alertSlice,
    fiche: ficheSlice
  },
})