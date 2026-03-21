
import { createSlice } from "@reduxjs/toolkit";

export const alertSlice = createSlice({
    name: 'alert',
    initialState: {
        message: "",
        type: "success",
        isVisible: false
    },
    reducers: {
        showAlert: (state, action) => {
            state.message = action.payload.message
            state.type = action.payload.type
            state.isVisible = true
        },
        hideAlert: (state) => {
            state.isVisible = false
        }
    }
})

// créateurs d'action 
export const {
    showAlert,
    hideAlert
} = alertSlice.actions

export default alertSlice.reducer