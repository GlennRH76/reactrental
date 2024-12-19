import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import EventTypeSelector from './pages/EventTypeSelector'
import DateAndDelivery from './pages/DateAndDelivery'
import InventoryList from './pages/InventoryList'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Navigation from './components/Navigation'
import { api } from './services/api'
import { BookingInfo, CartItem, CustomerInfo, Product } from './interface'
import { parse } from 'date-fns'

const App: React.FC = () => {
  let lStorageValue = JSON.parse(window.localStorage.getItem('CartInfo') ?? '{}')
  const [eventType, setEventType] = useState(lStorageValue.eventType ?? 'All')
  const [startDate, setStartDate] = useState(lStorageValue.startDate ?? '')
  const [endDate, setEndDate] = useState(lStorageValue.endDate ?? '')
  const [deliveryPlace, setDeliveryPlace] = useState<'custom' | 'warehouse'>(lStorageValue.deliveryPlace ?? 'custom')
  const [deliveryAddress, setDeliveryAddress] = useState(lStorageValue.deliveryAddress ?? '')
  const [hireDuration, setHireDuration] = useState<number>(lStorageValue.hireDuration ?? 0)
  const [deliveryDistance, setDeliveryDistance] = useState<number>(lStorageValue.deliveryDistance ?? 0)
  const [datesArray, setdatesArray] = useState(lStorageValue.datesArray ?? [])
  const [cart, setCart] = useState<CartItem[]>(lStorageValue.cart ?? [])
  const [displayedItems, setDisplayedItems] = useState<Product[]>([])
  const [bookingInfo, setBookingInfo] = useState<BookingInfo>(lStorageValue.bookingInfo ?? {
    taxesByName:{},
    chargeable_days: 1,
    deliveryDate: '',
    collectionDate: '',
    surCharge: 0,
    distance: 0,
    delivery: '',
    delivery_to: '',
    deliveryPlace: 'custom',
    collection_surcharge: 0,
    delivery_surcharge: 0
  })
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(lStorageValue.customerInfo ?? {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    vName: '',
    vAddress: '',
    vCity: '',
    vPostcode: '',
    contactName: '',
    contactPhone: ''
  })

  const addToCart = (newItem: Product) => {
    const existingItemIndex = cart.findIndex((item) => item.item_id === newItem.item_id)
    if (existingItemIndex !== -1) {
      const updatedCart = cart.map((item) => {
        if (item.item_id === newItem.item_id && item.itemCount != item.storeQuantity) {
          return {
            ...item,
            itemCount: item.itemCount + 1
          }
        }
        return item
      })
      setCart(updatedCart)
    } else {
      const newCartItem: CartItem = {
        ...newItem,
        itemCount: 1
      }
      setCart([...cart, newCartItem])
    }
  }

  const removeFromCart = (productId: string) => {
    const existingItemIndex = cart.findIndex((item) => item.item_id === productId)
    if (existingItemIndex !== -1) {
      const updatedCart = cart
        .map((item) => {
          if (item.item_id === productId) {
            if (item.itemCount > 1) {
              return {
                ...item,
                itemCount: item.itemCount - 1
              }
            } else {
              return null
            }
          }
          return item
        })
        .filter((item) => item !== null) as CartItem[]

      setCart(updatedCart)
    } else {
      setCart(cart)
    }
  }

  const getProducts = async () => {
    const localStartDate = parse(startDate, "MMM do yyyy 'at' h:mm a", new Date())
    const localEndDate = parse(endDate, "MMM do yyyy 'at' h:mm a", new Date())
    const dateData = {
      delivery_date:
        localStartDate.getFullYear() +
        '-' +
        (localStartDate.getMonth() + 1) +
        '-' +
        localStartDate.getDate(),
      delivery_time:
        localStartDate.getHours() +
        ':' +
        localStartDate.getMinutes() +
        ':' +
        localStartDate.getSeconds(),
      collection_date:
        localEndDate.getFullYear() +
        '-' +
        (localEndDate.getMonth() + 1) +
        '-' +
        localEndDate.getDate(),
      collection_time:
        localEndDate.getHours() + ':' + localEndDate.getMinutes() + ':' + localEndDate.getSeconds()
    }
    let cartItems = cart.map(item => {
      return {
        itemId: item.item_id,
        itemCount: item.itemCount,
        price: item.price,
        spType: item.sp_type,
        serviceCharges: item.service_charges,
        itemName: item.title
      }
    });
    const itemsToDisplay = await api.getInventory({ category_id: eventType, dateData: dateData, cartItems });
    let temp: Product[] = [];
    temp = itemsToDisplay.data.map((item : any) => ({
      ...item,
      thumbnails: [...new Set(item.thumbnails.split(','))].join(',')
    }));
    setDisplayedItems(temp);
  }

  useEffect(() => {
    setDeliveryAddress(deliveryAddress)
    getProducts()
  }, [deliveryAddress, deliveryDistance])

  useEffect(() => {
    window.localStorage.setItem('CartInfo', JSON.stringify({
      deliveryPlace, deliveryAddress, deliveryDistance, hireDuration, bookingInfo, customerInfo, datesArray, eventType, startDate, endDate, cart
    }))
  }, [deliveryPlace, deliveryAddress, deliveryDistance, hireDuration, bookingInfo, customerInfo, datesArray, eventType, startDate, endDate, cart])

  useEffect(() => {
    const fetchBusinessDays = async () => {
    const getAvailableDays = (await api.getAvailableDays()).data
      const datesArray = (await api.getBusinessDays()).data
      localStorage.setItem('availableDays',JSON.stringify(getAvailableDays))
      setdatesArray(datesArray)
    }
    fetchBusinessDays()
  }, [])

  useEffect(()=>{
    const changeDistance = async () =>{
      const distance = (await api.getDistance(deliveryAddress)).data
      setDeliveryDistance(distance.distance)
    }
    changeDistance()
  },[deliveryAddress])
  useEffect(() => {
    if (startDate && endDate) {
      getProducts()
    }
  }, [cart, startDate, endDate, eventType])

  const cartItemCount = cart.reduce((total, item) => total + item.itemCount, 0)
  return (
    <Router>
      <div className='min-h-screen bg-gray-100'>
        <Navigation cartItemCount={cartItemCount} />
        <div className='container mx-auto px-4 py-8 pt-20'>
          <Routes>
            <Route
              path='/'
              element={
                <EventTypeSelector setEventType={setEventType} getCategories={api.getCategories} />
              }
            />
            <Route
              path='/date-delivery'
              element={
                <DateAndDelivery
                  datesArray={datesArray}
                  setStartDate={setStartDate}
                  setEndDate={setEndDate}
                  setDeliveryPlace={setDeliveryPlace}
                  setDeliveryAddress={setDeliveryAddress}
                  setHireDuration={setHireDuration}
                  setDeliveryDistance={setDeliveryDistance}
                  setBookingInfo={setBookingInfo}
                  getProducts={getProducts}
                  setDisplayedItems={setDisplayedItems}
                  deliveryDistance={deliveryDistance}
                />
              }
            />
            <Route
              path='/inventory'
              element={
                <InventoryList
                  eventType={eventType}
                  addToCart={addToCart}
                  cart={cart}
                  hireDuration={hireDuration}
                  displayedItems={displayedItems}
                />
              }
            />
            <Route
              path='/product/:id'
              element={
                <ProductDetail
                  cart={cart}
                  addToCart={addToCart}
                  hireDuration={hireDuration}
                  displayedItems={displayedItems}
                />
              }
            />
            <Route
              path='/cart'
              element={
                <Cart
                  cart={cart}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                  datesArray={datesArray}
                  bookingInfo={bookingInfo}
                  startDate={startDate}
                  endDate={endDate}
                  deliveryPlace={deliveryPlace}
                  deliveryAddress={deliveryAddress}
                  hireDuration={hireDuration}
                  deliveryDistance={deliveryDistance}
                  setDeliveryPlace={setDeliveryPlace}
                  setDeliveryAddress={setDeliveryAddress}
                  setStartDate={setStartDate}
                  setEndDate={setEndDate}
                  setHireDuration={setHireDuration}
                />
              }
            />
            <Route
              path='/checkout'
              element={
                <Checkout
                  cart={cart}
                  bookingInfo={bookingInfo}
                  customerInfo={customerInfo}
                  setCustomerInfo={setCustomerInfo}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
