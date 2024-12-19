import { createStore, applyMiddleware } from 'redux'
import thunk, { ThunkAction } from 'redux-thunk'
import appReducer from './reducers'
import { AppState } from './types'
import { setUser, addRentalItem, addToCart } from './actions'

const store = createStore(appReducer, applyMiddleware(thunk))

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Define Action Union Type
export type Action =
  | ReturnType<typeof setUser>
  | ReturnType<typeof addRentalItem>
  | ReturnType<typeof addToCart>

// Thunk Action Type
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>

export default store
