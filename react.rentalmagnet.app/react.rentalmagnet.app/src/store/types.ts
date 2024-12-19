export interface User {
  id: string
  name: string
  email: string
}

export interface RentalItem {
  id: string
  title: string
  price: number
}

export interface CartItem {
  rentalItemId: string
  quantity: number
}

export interface AppState {
  user: User | null
  rentalItems: RentalItem[]
  cart: CartItem[]
}
