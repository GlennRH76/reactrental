

import React, { useState, useEffect, useRef } from 'react'
import {CartItem, CheckoutProps } from '../interface'
import { api } from '../services/api'
import { parse, format } from 'date-fns'
import SetConfirmTerm from '../components/SetConfirmTerm'
import Autocomplete from 'react-google-autocomplete'
const VITE_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const paymentUrl = import.meta.env.VITE_PAYMENT_URL
let addressArray: string[] = []
const Checkout: React.FC<CheckoutProps> = ({
  cart
}) => {
  const [fullAddress, setFullAddress] = useState('')
  const deliveryAddressRef = useRef<HTMLInputElement>(null)
  const [noteText, setNoteText] = useState('')
  const [customerDetails, setCustomerDetails] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    postcode: '',
    company_name: '',
    street_address: ''
  })
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [confirmClick, setConfirmClick] = useState<boolean>(false)
  const [deliveryDetails, setDeliveryDetails] = useState({
    delivery_city: '',
    delivery_contact_name: '',
    delivery_postcode: '',
    delivery_phone: '',
    delivery_email: '',
    venue_name: '',
    delivery_street: ''
  })
  const [localVal, setLocalVal] = useState({
    taxesByName: {
      Hire: '',
      Service: ''
    },
    delivery: '',
    delivery_to: '',
    surCharge: 0,
    final_item: 0,
    deliveryPlace: 'custom',
    deliveryDate: '',
    collectionDate: '',
    distance: 0,
    chargeable_days : 0,
    delivery_surcharge: 0,
    collection_surcharge: 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  useEffect(() => {
    const localValue = JSON.parse(localStorage.getItem('bookingInfo') || '{}')
    setTimeout(() => {
      if (localValue.deliveryPlace === 'custom' && deliveryAddressRef.current) {
        deliveryAddressRef.current.value = localValue.delivery_to
      }
    }, 100)
    setLocalVal(localValue)
    window.scrollTo(0, 0)
  }, [])

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: isSubmitting ? 'not-allowed' : 'pointer',
    backgroundColor: isSubmitting ? '#ccc' : '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    opacity: isSubmitting ? 0.6 : 1,
    transition: 'opacity 0.3s ease'
  }

  const handleCustomerDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerDetails({
      ...customerDetails,
      [e.target.name]: e.target.value
    })
  }

  const handleDeliveryDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeliveryDetails({
      ...deliveryDetails,
      [e.target.name]: e.target.value
    })
  }
  const closeModal = () => {
    setIsModalOpen(false)
  }

  const confirmClicked =(e: boolean)=>{
    setConfirmClick(e)
    setIsModalOpen(false)
  }

  const openModal = () => setIsModalOpen(true)

  useEffect(() => {
    if (confirmClick) {
      handleSubmit();
    }
  }, [confirmClick]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if(e){
      e.preventDefault()
    }
    if (confirmClick == false) {
      openModal(); // Assuming openModal correctly handles modal state
      return;
    }
    if(confirmClick == true && isModalOpen == false){
      setIsSubmitting(true)
      // Original date string
      const delivery_Date = localVal.deliveryDate
      const collecte_Date = localVal.collectionDate
      // Clean up the date string: remove "th", "st", "rd", "nd", and "at"
      const deliveryDateString = delivery_Date
        .replace(/(\d+)(th|st|nd|rd)/, '$1') // Removes 'th', 'slet addressArray : any[]= [];t', 'nd', 'rd'
        .replace(' at ', ' ') // Removes "at"
        .trim()
        const collectDateString = collecte_Date
        .replace(/(\d+)(th|st|nd|rd)/, '$1') // Removes 'th', 'st', 'nd', 'rd'
        .replace(' at ', ' ') // Removes "at"
        .trim()
      // Now parse the cleaned string into a valid Date object
      const deliveryObj = parse(deliveryDateString, 'MMM d yyyy h:mm a', new Date())
      const collectObj = parse(collectDateString, 'MMM d yyyy h:mm a', new Date())
      // Check if dateObj is a valid date
      if (isNaN(deliveryObj.getTime()) || isNaN(collectObj.getTime())) {
        console.error('Invalid date')
        return
      }
      const deliveryTime = format(deliveryObj, 'HH:mm:ss')
      const collectionDate = format(collectObj, 'yyyy-MM-dd')
      const collectionTime = format(collectObj, 'HH:mm:ss')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bookingDetail: Record<string, any> = { ...customerDetails, ...deliveryDetails } 
      bookingDetail.deliveryDate = format(deliveryObj, 'yyyy-MM-dd')
      bookingDetail.deliveryTime = deliveryTime
      bookingDetail.collectionDate = collectionDate
      bookingDetail.collectionTime = collectionTime
      bookingDetail.customer_address = fullAddress
      bookingDetail.delivery = localVal.delivery
      bookingDetail.rentalTax = localVal.taxesByName.Hire
      bookingDetail.serviceTax = localVal.taxesByName.Service
      bookingDetail.delivery_to = (localVal.deliveryPlace === 'custom' ? localVal.delivery_to : '')
      bookingDetail.distance = localVal.distance
      bookingDetail.chargeable_days = localVal.chargeable_days
      bookingDetail.surCharge = localVal.surCharge
      bookingDetail.delivery_surcharge = localVal.delivery_surcharge
      bookingDetail.collection_surcharge = localVal.collection_surcharge
      bookingDetail.final_amount = localVal.final_item
      bookingDetail.note_content = noteText
      bookingDetail.residential_address = addressArray[0]??''
      bookingDetail.city = addressArray[1]??''
      bookingDetail.delivery_place = localVal.deliveryPlace === 'custom' ? 'custom' : 'warehouse'
      bookingDetail.state = addressArray[2]??''
      bookingDetail.postcode = addressArray[4]??''
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cartItems: Array<CartItem> = cart
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: Record<string, any> = {};
      data.bookingDetail = bookingDetail
      data.cartItems = cartItems
      try {
        const response = await api.saveBookingInfo(data)
        const redirectUrl = response.data.redirectUrl
        localStorage.removeItem('bookingInfo')
        localStorage.removeItem('cartItem')
        localStorage.removeItem('CartInfo')
        if (redirectUrl != undefined) {
          const url = new URL(redirectUrl)
          const pathSegments = url.pathname.split('/')
          const id = pathSegments[pathSegments.length - 1]
          window.location.href = `${paymentUrl}${id}`
        }
        // Handle success - e.g., show success message or redirect
      } catch (error) {
        console.error('Error saving booking info:', error)
        // Handle error - e.g., show error message
      }
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteText(e.target.value) // Update state with the new value
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePlaceSelect = (place : any) => {
    addressArray = []
    // Initialize an array to collect address components
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    place.address_components.forEach((component : any) => {
      // Filter specific types for address components
      if (component.types.includes('subpremise')) {
        addressArray.unshift(component.long_name) // Apartment/unit number
      }
      if (component.types.includes('street_number')) {
        addressArray.push(component.long_name) // Street number
      }
      if (component.types.includes('route')) {
        addressArray.push(component.long_name) // Street name
      }
      if (component.types.includes('locality')) {
        addressArray.push(component.long_name) // City
      }
      if (component.types.includes('administrative_area_level_1')) {
        addressArray.push(component.short_name) // State
      }
      if (component.types.includes('country')) {
        addressArray.push(component.long_name) // Country
      }
      if (component.types.includes('postal_code')) {
        addressArray.push(component.long_name) // Postcode
      }
    })
    // Join the address components to create a full address
    const fullAddress = addressArray.join(', ')
    setFullAddress(fullAddress)
  }

  return (
    <>
    <SetConfirmTerm isOpen={isModalOpen} onClose={closeModal} cofirmClick = {confirmClicked }/>
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold text-center mb-6'>Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className='mb-6 bg-gray-50 p-6 rounded-lg shadow-lg'>
          <h2 className='mb-6 '>Customer Details</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <input
              type='text'
              name='first_name'
              value={customerDetails.first_name}
              onChange={handleCustomerDetailsChange}
              placeholder='First Name'
              className='w-full p-2 border rounded'
              required
            />
            <input
              type='text'
              name='last_name'
              value={customerDetails.last_name}
              onChange={handleCustomerDetailsChange}
              placeholder='Last Name'
              className='w-full p-2 border rounded'
              required
            />
            <input
              type='email'
              name='email'
              value={customerDetails.email}
              onChange={handleCustomerDetailsChange}
              placeholder='Email'
              className='w-full p-2 border rounded'
              required
            />
            <input
              type='tel'
              name='phone'
              value={customerDetails.phone}
              onChange={handleCustomerDetailsChange}
              placeholder='Phone'
              className='w-full p-2 border rounded'
              required
            />
          </div>
          <div>
            <Autocomplete
              id='customerAddress'
              placeholder='Customer Address'
              className='w-full p-2 mt-4 border rounded'
              apiKey={VITE_GOOGLE_MAPS_API_KEY}
              onPlaceSelected={handlePlaceSelect}
              options={{
                componentRestrictions: { country: 'au' },
                types: ['address'] // restrict to cities
              }}
            />
          </div>
          <div>
            <input
              type='text'
              name='street_address'
              value={customerDetails.street_address}
              onChange={handleCustomerDetailsChange}
              placeholder='Extra Address Details'
              className='w-full p-2 mt-4 border rounded'
            />
          </div>
          <div>
            <input
              type='text'
              name='company_name'
              value={customerDetails.company_name}
              onChange={handleCustomerDetailsChange}
              placeholder='Company Name'
              className='w-full p-2 mt-4 border rounded'
            />
          </div>
        </div>
        <div className='mb-6 bg-gray-50 p-6 rounded-lg shadow-lg'>
          <h2 className='text-xl font-semibold mb-2'>Note For your Order</h2>
          <textarea
            id='customTextarea'
            rows={5} // Set number of rows
            cols={50} // Set number of columns
            placeholder='Write down if you have anything to leave to us for your order'
            value={noteText} // Bind the state to textarea
            onChange={handleTextChange}
            style={{
              padding: '10px',
              fontSize: '16px',
              borderColor: '#ccc',
              borderRadius: '5px',
              width: '100%',
              resize: 'vertical' // Allows vertical resizing only
            }}
          />
        </div>
        {localVal.deliveryPlace === 'custom' && (
          <div className='mb-6 bg-gray-50 p-6 rounded-lg shadow-lg'>
            <h2 className='text-xl font-semibold mb-2'>Delivery Details</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Autocomplete
                id='deliveryAddress'
                placeholder='Delivery Address'
                className='w-full p-2 mt-4 border rounded'
                ref={deliveryAddressRef}
                apiKey={VITE_GOOGLE_MAPS_API_KEY}
                onPlaceSelected={handlePlaceSelect}
                options={{
                  componentRestrictions: { country: 'au' },
                  types: ['address'] // restrict to cities
                }}
                disabled={true}
              />
              <input
                type='text'
                name='delivery_street'
                value={deliveryDetails.delivery_street}
                onChange={handleDeliveryDetailsChange}
                placeholder='Extra Address Details'
                className='w-full p-2 mt-4 border rounded'
              />
              <input
                type='text'
                name='delivery_contact_name'
                value={deliveryDetails.delivery_contact_name}
                onChange={handleDeliveryDetailsChange}
                placeholder='Delivery Contact Name'
                className='w-full p-2 border rounded'
                required
              />
              <input
                type='tel'
                name='delivery_phone'
                value={deliveryDetails.delivery_phone}
                onChange={handleDeliveryDetailsChange}
                placeholder='Delivery Phone'
                className='w-full p-2 border rounded'
              />
              <input
                type='text'
                name='venue_name'
                value={deliveryDetails.venue_name}
                onChange={handleDeliveryDetailsChange}
                placeholder='Venue Name'
                className='w-full p-2 border rounded'
              />
              <input
                type='email'
                name='delivery_email'
                value={deliveryDetails.delivery_email}
                onChange={handleDeliveryDetailsChange}
                placeholder='Delivery Email'
                className='w-full p-2 border rounded'
              />
            </div>
          </div>
        )}

        <div className='mb-6 bg-gray-50 p-6 rounded-lg shadow-lg'>
          <h2 className='text-xl font-semibold mb-2'>Order Summary</h2>
          <p>Start Date: {localVal.deliveryDate}</p>
          <p>End Date: {localVal.collectionDate}</p>
          <p>Delivery Option: {localVal.deliveryPlace == 'custom'? 'delivery': 'pick up'}</p>
        </div>
        <button
          style={{
            ...buttonStyle,
            backgroundColor: '#007BFF',
            marginLeft: '10px'
          }}
          type='submit'
          className='bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600'
           disabled={isSubmitting}
        >
          Place Order
        </button>
      </form>
    </div>
    </>
  )
}

export default Checkout
