import { ActionTypes } from './actionTypes'
import { User, RentalItem, CartItem } from './types'

export const setUser = (user: User | null) => ({
  type: ActionTypes.SET_USER as const,
  payload: user
})

export const addRentalItem = (item: RentalItem) => ({
  type: ActionTypes.ADD_RENTAL_ITEM as const,
  payload: item
})

export const addToCart = (cartItem: CartItem) => ({
  type: ActionTypes.ADD_TO_CART as const,
  payload: cartItem
})
