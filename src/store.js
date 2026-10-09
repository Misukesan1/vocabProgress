import { configureStore } from '@reduxjs/toolkit'
import { setLastCollection } from './utils/lastCollection'
import { setLastFiche } from './utils/lastFiche'
import { setLastTraining } from './utils/lastTraining'

// import des slices
import profileSlice from './features/profileSlice'
import alertSlice from './features/alertSlice'
import ficheSlice from './features/ficheSlice'
import trainingSlice from './features/trainingSlice'

const store = configureStore({
  reducer: {
    profile: profileSlice,
    alert: alertSlice,
    fiche: ficheSlice,
    training: trainingSlice
  },
})

// Sauvegarde de la collection, de la fiche sélectionnées et de la session d'entraînement à chaque changement
let lastSelectedProfile = store.getState().profile.selectedProfile
let lastSelectedFiche = store.getState().fiche.selectedFiche
let lastTraining = store.getState().training
store.subscribe(() => {
  const selectedProfile = store.getState().profile.selectedProfile
  if (selectedProfile !== lastSelectedProfile) {
    lastSelectedProfile = selectedProfile
    setLastCollection(selectedProfile)
  }
  const selectedFiche = store.getState().fiche.selectedFiche
  if (selectedFiche !== lastSelectedFiche) {
    lastSelectedFiche = selectedFiche
    setLastFiche(selectedFiche)
  }
  const training = store.getState().training
  if (training !== lastTraining) {
    lastTraining = training
    setLastTraining(training)
  }
})

export default store
