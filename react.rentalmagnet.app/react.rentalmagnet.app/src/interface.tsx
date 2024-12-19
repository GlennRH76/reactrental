export interface Product {
    item_id: string;
    title: string;
    price: string;
    quantity: string
    description: string;
    thumbnails: string;
    storeQuantity: number;
    service_charges: string;
    sp_type: string;
    public: string;
    active: string;
  }
  
export interface CategoryInfo {
  category_id: string
  count: string
  title: string
}

export interface InventoryListProps {
  eventType: string
  addToCart: (productId: Product) => void
  cart: CartItem[]
  hireDuration: number
  displayedItems: Product[]
}

export interface CartItem extends Product {
  itemCount: number
}

export interface ConfirmProps {
  bookingInfo: BookingInfo
  cartItems: CartItem[]
  customerInfo: CustomerInfo
}

export interface ProductDetailProps {
  cart : CartItem[]
  addToCart: (product: Product) => void
  hireDuration: number
  displayedItems: Product[]
}

export interface CartProps {
  startDate: string
  endDate: string
  deliveryPlace: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  datesArray: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hireDuration: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deliveryDistance: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deliveryAddress: any
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  bookingInfo: {
    chargeable_days: number
    deliveryPlace: 'custom' | 'warehouse'
    deliveryDate: string
    collectionDate: string
    surCharge: number
    distance: number
    delivery_to: string
  }
  setDeliveryPlace: (option: 'custom' | 'warehouse') => void
  setDeliveryAddress: (address: string) => void
  setStartDate: (startDate: string) => void
  setEndDate: (setEndDate: string) => void
  setHireDuration: (hireDuration: number) => void
}

export interface CheckoutProps {
  bookingInfo: BookingInfo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cart: any
  customerInfo: CustomerInfo
  setCustomerInfo: (customerInfo: CustomerInfo) => void
}

export interface Place {
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: () => number
      lng: () => number
    }
  }
}

export interface DateAndDeliveryProps {

  setStartDate: (date: string) => void
  setEndDate: (date: string) => void
  setDeliveryPlace: (option: 'custom' | 'warehouse') => void
  setDeliveryAddress: (address: string) => void
  setHireDuration: (duration: number) => void
  setDeliveryDistance: (distance: number) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  datesArray: any []
  deliveryDistance: number
  getProducts: () => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setDisplayedItems: (items: any) => void
  setBookingInfo: (bookingInfo: BookingInfo) => void
}

export interface ConfirmProps {
  bookingInfo: BookingInfo
  cartItems: CartItem[]
  customerInfo: CustomerInfo
}
export interface BookingInfo {
  maxDistance: number,
  taxesByName: Object,
  chargeable_days: number
  delivery: string,
  deliveryPlace: 'custom' | 'warehouse'
  deliveryDate: string
  collectionDate: string
  surCharge: number
  distance: number
  delivery_to: string
  delivery_surcharge: number
  collection_surcharge : number 
}
export interface CustomerInfo {
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  city: string
  postcode: string
  vName: string | undefined
  vAddress: string | undefined
  vCity: string | undefined
  vPostcode: string | undefined
  contactName: string | undefined
  contactPhone: string | undefined
}

export interface GetInventoryParamType {
  category_id: string
  dateData:
    | {
        delivery_date: string
        delivery_time: string
        collection_date: string
        collection_time: string
      }
    | undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cartItems: any
}
