// reducers.ts
import { AppState, User, RentalItem, CartItem } from './types'
import { ActionTypes } from './actionTypes'
import { Action } from './store' // Will define Action type in store.ts

const initialState: AppState = {
  user: null,
  rentalItems: [],
  cart: []
}

const appReducer = (state = initialState, action: Action): AppState => {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload as User
      }
    case ActionTypes.ADD_RENTAL_ITEM:
      return {
        ...state,
        rentalItems: [...state.rentalItems, action.payload as RentalItem]
      }
    case ActionTypes.ADD_TO_CART:
      return {
        ...state,
        cart: [...state.cart, action.payload as CartItem]
      }
    default:
      return state
  }
}

export default appReducer
