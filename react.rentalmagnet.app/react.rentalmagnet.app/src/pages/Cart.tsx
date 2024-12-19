import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Minus, Truck, Home, Edit2 } from 'lucide-react'
import { CartItem, CartProps, Place } from '../interface';
import { format, addDays, parse, isValid, differenceInHours, differenceInDays } from 'date-fns'
import { api } from '../services/api'
import DatePicker from 'react-datepicker'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-datepicker/dist/react-datepicker.css'
import './styles/custom-date-picker.css'
import Autocomplete from 'react-google-autocomplete'

const imageUrl = import.meta.env.VITE_IMAGE_URL
const VITE_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
interface UnavailableDateType {
  unavaliable_date: string; // or Date if the value is already a Date
}
const Cart: React.FC<CartProps> = ({
  cart,
  addToCart,
  removeFromCart,
  bookingInfo,
  startDate,
  endDate,
  deliveryPlace,
  datesArray,
  deliveryAddress,
  hireDuration,
  deliveryDistance,
  setDeliveryPlace,
  setDeliveryAddress,
  setStartDate,
  setEndDate,
  setHireDuration
}) => {
  const navigate = useNavigate()
  const [isEditingDates, setIsEditingDates] = useState(false)
  const [editedStartDate, setEditedStartDate] = useState<Date | null>(
    parse(startDate, "MMM do yyyy 'at' h:mm a", new Date())
  )
  const [editedEndDate, setEditedEndDate] = useState<Date | null>(
    parse(endDate, "MMM do yyyy 'at' h:mm a", new Date())
  )
  const [startClickedDate, setStartClickedDate] = useState<Date | null>(null)
  const deliveryAddressRef = useRef<HTMLInputElement>(null)
  const [isAddressHighlighted, setIsAddressHighlighted] = useState(false)
  const [surcharge, setSurcharge] = useState(0)
  const [deliveryCost, setDeliveryCost] = useState<string | number>(0)
  const [taxesByName, setTaxesByName] = useState<{ [key: string]: number }>({})
  const [unAvilableDay, setUnAvailableDay] = useState<Date[]>([])
  const [subTotalPriceTemp, setSubTotal ] = useState(0)
  // const [changeDistanceFromServer, setChangeDistanceFromServer] = useState(0)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [bussinessDay, setBussinessDay] = useState([])
  const [chargeDays, setChargeDays] = useState([])
  type TaxType = {
    tax_type_id: string
    name: string
    percent: string
    inexclude: string
    type: string
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    if (JSON.parse(localStorage.getItem('bookingInfo') ?? '{}').deliveryPlace == 'custom') {
      if (deliveryAddressRef.current) {
        deliveryAddressRef.current.value =
          JSON.parse(localStorage.getItem('bookingInfo') ?? '{}').delivery_to || ''
      }
    }
  }, [deliveryPlace])

  useEffect(()=>{
    const changeDistanceFromServer = async()=>{
      const distanceFromServer = (await api.getDistance(deliveryAddress)).data
      console.log(distanceFromServer.distance);
      JSON.parse(localStorage.getItem('bookingInfo') ?? '{}')
    }
    changeDistanceFromServer();
  },[deliveryAddress, deliveryDistance])
  
  useEffect(() => {
    async function fetchDeliveryCost() {
      const price = await calculateDeliveryPrice()
      setDeliveryCost(price)
    }
    fetchDeliveryCost()
  }, [hireDuration, deliveryAddress, deliveryDistance])

  useEffect(() => {
    let unAvailableTemp: any = []
    Object.values(JSON.parse(localStorage.getItem('availableDays') ?? '{}').unavaliableDates as UnavailableDateType[]).map(obj => {
      const unavailableDate = new Date(obj.unavaliable_date);  // Create a Date object
      unavailableDate.setDate(unavailableDate.getDate() + 1); // Increment the date by 1 day
      unAvailableTemp.push(unavailableDate);  // Push the next day to unAvailableTemp
    });
    setUnAvailableDay(unAvailableTemp)
    const fetchData = async () => {
      const multiplierTimeline = (await api.getMultiplierTimeline()).data
      setChargeDays(multiplierTimeline)
      try {
        const [deliveryPrice, taxesByName] = await Promise.all([
          calculateDeliveryPrice(),
          calculateTax()
        ])

        setDeliveryCost(deliveryPrice)
        setTaxesByName(taxesByName || {})
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [surcharge, cart,subTotalPriceTemp,deliveryPlace, deliveryCost])
  useEffect(() => {
    calculateSurcharge()
  }, [startDate, endDate])

 

  useEffect(() => {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const temp: any = []
    const bookingInfo = JSON.parse(localStorage.getItem('bookingInfo') ?? '{}')
    const localStartDate = bookingInfo.deliveryDate.replace(/(\d+)(st|nd|rd|th)/, "$1").replace(" at", "")
    //const localEndDate = bookingInfo.collectionDate.replace(/(\d+)(st|nd|rd|th)/, "$1").replace(" at", "")
    const startDeliveryDate = parse(localStartDate, "MMM d yyyy h:mm a", new Date());
    //const endDeliveryDate = parse(localEndDate, "MMM d yyyy h:mm a", new Date());
    if (startDeliveryDate != null) {
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      datesArray.map((dateT: any) => {
        temp.push(dateT[weekDays[startDeliveryDate.getDay()].toLowerCase()])
      })
    }
    setBussinessDay(temp)
    display()
    displayTaxByName(deliveryPlace)
  }, [bookingInfo.deliveryDate, deliveryPlace])
  const calculateActualDuration = () => {
    const start = parse(startDate, "MMM do yyyy 'at' h:mm a", new Date())
    const end = parse(endDate, "MMM do yyyy 'at' h:mm a", new Date())
    if (isValid(start) && isValid(end)) {
      const days = differenceInDays(end, start)
      const remainingHours = differenceInHours(end, start) % 24
      return `${days}d, ${remainingHours}h`
    }
    return 'Invalid date'
  }

  const calculateItemTotalPrice = (item: CartItem) => {
    return Number(item.price) * item.itemCount * hireDuration
  }

  const calculateSubTotalPrice = () => {
    const subTotal = cart.reduce((total, item) => total + calculateItemTotalPrice(item), 0)
    return subTotal
  }

  const calculateTotalPrice = () => {
    const chartValue = isNaN(surcharge) ? 0 : surcharge
    let delivery = 0
    if (deliveryPlace == 'custom') {
      delivery = Number(deliveryCost)
    } else {
      delivery = 0
    }
    return (
      cart.reduce((total, item) => total + calculateItemTotalPrice(item), 0) + chartValue + delivery
    )
  }


  const calculateDeliveryPrice = async () => {
    const subTotal: number = calculateSubTotalPrice()
    setSubTotal(subTotal)
    const CONST_DELIVERY_SETTINGS = (await api.getSystemDelivery()).data
    if (
      subTotal === 0 ||
      deliveryDistance == 0 ||
      deliveryPlace == 'warehouse' ||
      CONST_DELIVERY_SETTINGS == null
    ) {
      return 0
    }
    
    let distance = (JSON.parse(localStorage.getItem('CartInfo') ?? '{}')).deliveryDistance
    console.log("this is distance", distance);
    distance =
      deliveryDistance > CONST_DELIVERY_SETTINGS.min_delivery_travel
        ? deliveryDistance
        : CONST_DELIVERY_SETTINGS.min_delivery_travel
    const origin_delivery_charge = distance * parseFloat(CONST_DELIVERY_SETTINGS.charges_per_mile)
    let delivery_charge = 0
    let delivery_discount = 0
    if (
      typeof CONST_DELIVERY_SETTINGS.delivery_discount !== 'undefined' &&
      CONST_DELIVERY_SETTINGS.delivery_discount == 1
    ) {
      delivery_discount =
        (Number(CONST_DELIVERY_SETTINGS.delivery_discount_perc) * subTotal ) / 100
    }
    if (origin_delivery_charge < CONST_DELIVERY_SETTINGS.min_delivery_charges) {
      delivery_charge = CONST_DELIVERY_SETTINGS.min_delivery_charges - delivery_discount
    } else {
      delivery_charge = origin_delivery_charge - delivery_discount
    }

    if (delivery_charge <= 0 || deliveryPlace == 'pickup') {
      return 0
    } else {
      return delivery_charge.toFixed(2)
    }
  }

  const calculateTax = async () => {
    try {
      const TaxTypes: TaxType[] = (await api.getTaxTypes()).data
      const subTotal = calculateSubTotalPrice()
      const deliveryPrice = await calculateDeliveryPrice()

      const taxTypeMap: { [key: string]: TaxType } = TaxTypes.reduce((map, tax) => {
        map[tax.type] = tax
        return map
      }, {} as { [key: string]: TaxType })
      const taxes: { rental: number; service: number; sale: number } = {
        rental: 0,
        service: 0,
        sale: 0
      }

      if (taxTypeMap.rental) {
        const rentalTax = parseFloat(taxTypeMap.rental.percent)
        taxes.rental = (subTotal * rentalTax) / (100 + rentalTax)
      }

      if (taxTypeMap.service) {
        const serviceTax = parseFloat(taxTypeMap.service.percent)
        taxes.service = (Number(deliveryPrice) * serviceTax) / (100 + serviceTax) + (Number(surcharge) * serviceTax) / (100 + serviceTax)
      }
      // if (taxTypeMap.sale) {
      //   const saleTax = parseFloat(taxTypeMap.sale.percent);
      //   taxes.sale = (subTotal * saleTax) / (100 + saleTax);
      // }

      taxes.rental = Number(taxes.rental.toFixed(2))
      taxes.service = Number(taxes.service.toFixed(2))
      taxes.sale = Number(taxes.sale.toFixed(2))

      const newTaxesByName: { [key: string]: number } = {}
      if (taxTypeMap.rental) {
        newTaxesByName[taxTypeMap.rental.name] = taxes.rental
      }
      if (taxTypeMap.service) {
        newTaxesByName[taxTypeMap.service.name] = taxes.service
      }
      if (taxTypeMap.sale) {
        newTaxesByName[taxTypeMap.sale.name] = taxes.sale
      }

      return newTaxesByName
    } catch (error) {
      console.error('Error calculating taxes:', error)
    }
  }
  const handleEditDates = () => {
    setIsEditingDates(true)
  }

  const handleSaveDates = () => {
    if (editedStartDate && editedEndDate) {
      setStartDate(format(editedStartDate, "MMM do yyyy 'at' h:mm a"))
      setEndDate(format(editedEndDate, "MMM do yyyy 'at' h:mm a"))
      const localVal = JSON.parse(localStorage.getItem('bookingInfo') ?? '{}')
      localVal.deliveryDate = format(editedStartDate, "MMM do yyyy 'at' h:mm a")
      localVal.collectionDate = format(editedEndDate, "MMM do yyyy 'at' h:mm a")
      localStorage.setItem('bookingInfo', JSON.stringify(localVal))
      // Recalculate hire duration
      const hours = differenceInHours(editedEndDate, editedStartDate)
      let newHireDuration = 0
      newHireDuration = chargeDays[hours]
      console.log("newHireDuration", newHireDuration);
      if (hours > 168) {
        newHireDuration = 1.5 + Math.ceil((hours - 40) / 24) * 0.5
      }
      setHireDuration(newHireDuration)
      calculateSurcharge()
    }
    setIsEditingDates(false)
  }

  const handleProceedToCheckout = () => {
    if (deliveryAddressRef.current) {
      if (deliveryAddressRef.current.value == ''&& deliveryPlace == 'custom') {
        toast.error('Must valid deliveryAdress', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: { backgroundColor: 'orange', color: '#fff' },
          progressStyle: { backgroundColor: '#fff' }
        })
        setDeliveryAddress("")
        return;
      }
    }

    if (
      deliveryPlace === 'custom' &&
      !JSON.parse(localStorage.getItem('bookingInfo') ?? '{}').delivery_to
    ) {
      setIsAddressHighlighted(true)
      deliveryAddressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      deliveryAddressRef.current?.focus()
      setTimeout(() => setIsAddressHighlighted(false), 3000) // Remove highlight after 3 seconds
      return
    }
    const bookingInfo = JSON.parse(localStorage.getItem('bookingInfo') ?? '{}')
    bookingInfo.surCharge = surcharge
    bookingInfo.item_total = calculateTotalPrice().toFixed(2)
    bookingInfo.paid_item = calculateSubTotalPrice().toFixed(2)
    bookingInfo.final_item = calculateTotalPrice().toFixed(2)
    bookingInfo.delivery = deliveryCost
    bookingInfo.deliveryPlace = deliveryPlace
    bookingInfo.taxesByName = taxesByName
    localStorage.setItem('bookingInfo', JSON.stringify(bookingInfo))
    //bookingInfo.final_itemCount = calculateItemTotalPrice(item).toFixed(2);
    localStorage.setItem('cartItem', JSON.stringify(cart))
    navigate('/checkout')
  }

  const handlePlaceSelect = async (place: Place) => {
    if (place && place.formatted_address) {
      if (deliveryAddressRef.current) {
        const distance = (await api.getDistance(place.formatted_address)).data
        if (distance.distance > JSON.parse(localStorage.getItem('bookingInfo') ?? '{}').maxDistance) {
          toast.warn('Distance exceeds maximum allowed delivery distance', {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: { backgroundColor: 'orange', color: '#fff' },
            progressStyle: { backgroundColor: '#fff' }
          })
          deliveryAddressRef.current.value = ''
          setDeliveryCost(0)
          return;
        } else {
          const bookingInfo = JSON.parse(localStorage.getItem('bookingInfo') ?? '{}');
          // Update the delivery_to property
          bookingInfo.delivery_to = place.formatted_address;
          localStorage.setItem('bookingInfo', JSON.stringify(bookingInfo));
          setDeliveryAddress(place.formatted_address)
        }
      }
    }
  }

  const calculateSurcharge = () => {
    let totalSurCharge = 0
    const bookingInfo = JSON.parse(localStorage.getItem('bookingInfo') ?? '{}')
    const localStartDate = bookingInfo.deliveryDate.replace(/(\d+)(st|nd|rd|th)/, "$1").replace(" at", "")
    const localEndDate = bookingInfo.collectionDate.replace(/(\d+)(st|nd|rd|th)/, "$1").replace(" at", "")
    const startDeliveryDate = parse(localStartDate, "MMM d yyyy h:mm a", new Date());
    const endDeliveryDate = parse(localEndDate, "MMM d yyyy h:mm a", new Date());
    if (startDeliveryDate) {
      const startHour = startDeliveryDate.getHours()
      const startDate = new Date(startDeliveryDate)
      const startCharge = datesDetect(startDate, startHour.toString()) // Ensure startHour is a string
      totalSurCharge += (isNaN(startCharge) ? 0 : startCharge)
      bookingInfo.delivery_surcharge = isNaN(startCharge) ? 0 : startCharge
    }
    if (endDeliveryDate) {
      const endHour = endDeliveryDate.getHours()
      const endDate = new Date(endDeliveryDate)
      const endCharge = datesDetect(endDate, endHour.toString())
      totalSurCharge += (isNaN(endCharge) ? 0 : endCharge) // Ensure endHour is a string
      bookingInfo.collection_surcharge = isNaN(endCharge) ? 0 : endCharge
    }
    localStorage.setItem('bookingInfo', JSON.stringify(bookingInfo))
    setSurcharge(totalSurCharge)
  }

  const datesDetect = (date: Date, hour: string): number => {
    const dayOfWeek = weekDays[date.getDay()].toLocaleLowerCase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const foundDate = datesArray.find((dates: any) => dates.bday_id == Number(hour) + 1)
    if (foundDate) {
      const temp = foundDate[dayOfWeek]
      return Number(temp) // Return the numeric value
    }
    return 0
  }

  const handleStartDayClick = (date: Date) => {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const temp: any = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    datesArray.map((dateT: any) => {
      temp.push(dateT[weekDays[date.getDay()].toLowerCase()])
    })
    setStartClickedDate(date)
    setBussinessDay(temp);
    display()
  };

  const handleEndDayClick = (date: Date) => {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const temp: any = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    datesArray.map((dateT: any) => {
      temp.push(dateT[weekDays[date.getDay()].toLowerCase()])
    })
    setBussinessDay(temp);
    display()
  };

  const displayTaxByName = (deliveryPlace: string) => {
    let updatedTaxesByName = { ...taxesByName };
    // if (deliveryPlace === 'warehouse') {
    //   updatedTaxesByName.Service = 0;
    // }
    return Object.entries(updatedTaxesByName).map(
      ([taxName, taxValue]) =>
        taxValue !== 0 && (
          <p key={taxName}>
            {taxName}: ${taxValue.toFixed(2)}
          </p>
        )
    );
  }
  function display() {
    return bussinessDay
      .map((price, index) => {
        const content = price !== "closed" ? `$${bussinessDay[index]}` : "closed";
        if (content === "closed") {
          return `
          .react-datepicker__time-list-item:nth-child(${index + 1}) {
            pointer-events: none;
            cursor: not-allowed;
            color: gray; /* Optional: Make it visually distinct */
          }
          .react-datepicker__time-list-item:nth-child(${index + 1})::after {
            content: "${content}";
            margin-left: 10px;
            font-weight: bold;
          }
        `;
        }
        return `
        .react-datepicker__time-list-item:nth-child(${index + 1})::after {
          content: "${content}";
          margin-left: 10px;
          font-weight: bold;
        }
      `;
      })
      .join("\n");
  }
  return (
    <div className='container mx-auto px-4 py-8'>
      <style>
        {`
          .react-datepicker__time-list-item::after {
            margin-left: 10px
          }
        ${display()}
        `}
      </style>
      <h1 className='text-3xl font-bold text-center mb-6'>Your Cart</h1>
      <ToastContainer />
      <div className='mb-6 bg-gray-50 p-6 rounded-lg shadow-lg'>
        <h2 className='text-2xl font-semibold mb-4'>Hire Duration</h2>
        <p>Start: <span className="font-medium">{startDate}</span></p>
        <p>End:  <span className="font-medium">{endDate}</span></p>
        <p>Duration:  <span className="font-medium">{calculateActualDuration()}</span></p>
        <p>Hire Charge:  <span className="font-medium">{hireDuration.toFixed(1)} days</span></p>
        <button
          onClick={handleEditDates}
          className='text-blue-500 hover:text-blue-700 flex items-center mt-2'
        >
          <Edit2 size={16} className='mr-1' /> Edit Dates
        </button>
        {isEditingDates && (
          <div className="relative">
            <DatePicker
              selected={editedStartDate}
              excludeDates={unAvilableDay}
              dropdownMode="select"
              popperPlacement="bottom"
              onChange={(date) => {
                setEditedStartDate(date)
                handleStartDayClick(date as Date)
              }
              }
              minDate={
                (() => {
                  const bookingInfo = JSON.parse(localStorage.getItem('bookingInfo') ?? '{}');
                  const deliveryDate = bookingInfo?.deliveryDate;
                  if (deliveryDate && !isNaN(parse(deliveryDate, "MMM do yyyy 'at' h:mm a", new Date()).getTime())) {
                    return parse(deliveryDate, "MMM do yyyy 'at' h:mm a", new Date());
                  }
                })()
              }
              timeIntervals={60}
              showTimeSelect
              dateFormat='MMM d, yyyy h:mm aa'
              className='mb-2 p-2 border rounded'
            />

            <DatePicker
              selected={editedEndDate}
              excludeDates={unAvilableDay}
              onChange={(date) => {
                setEditedEndDate(date)
                handleEndDayClick(date as Date)
              }}
              timeIntervals={60}
              showTimeSelect
              minDate={startClickedDate ? addDays(startClickedDate, 1) : new Date()}
              dateFormat='MMM d, yyyy h:mm aa'
              className='mb-2 p-2 border rounded '
            />
            <button onClick={handleSaveDates} className='bg-blue-500 text-white py-1 px-3 rounded'>
              Save Dates
            </button>
          </div>
        )}
      </div>
      <div className='mb-6 bg-gray-50 p-6 rounded-lg shadow-lg'>
        <h2 className='text-xl font-semibold mb-2'>Cart Items</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <div className='space-y-4'>
            {cart.map(
              (item) =>
                item.itemCount > 0 && (
                  <div
                    key={item.item_id}
                    className='flex items-center justify-between bg-white p-4 rounded-lg shadow'
                  > <div className='flex items-center'>
                      <img
                        src={imageUrl + item.thumbnails.split(',')[0]}
                        alt={item.title}
                        className='w-16 h-16 object-cover rounded mr-4'
                      />
                      <div>
                        <h3 className='font-semibold'>{item.title}</h3>
                        <p className='text-sm text-gray-600'>${item.price} per day</p>
                        <p className='text-sm font-bold'>
                          Total: ${calculateItemTotalPrice(item).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center'>
                      <button
                        onClick={() => removeFromCart(item.item_id)}
                        className='text-gray-500 hover:text-red-500'
                      >
                        <Minus size={20} />
                      </button>
                      <span className='mx-2'>{item.itemCount}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className='text-gray-500 hover:text-green-500 '
                        disabled={Number(item.quantity) == Number(item.itemCount)}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                )
            )}
          </div>
        )}
      </div>
      <div className='mb-6 bg-gray-50 p-6 rounded-lg shadow-lg'>
        <h2 className='text-xl font-semibold mb-2'>Delivery Options</h2>
        <div className='flex space-x-4 mb-4'>
          <label className='flex items-center'>
            <input
              type='radio'
              value='delivery'
              checked={deliveryPlace === 'custom'}
              onChange={() => setDeliveryPlace('custom')}
              className='mr-2'
            />
            <Truck size={20} className='mr-1' /> Delivery
          </label>
          <label className='flex items-center'>
            <input
              type='radio'
              value='pickup'
              checked={deliveryPlace === 'warehouse'}
              onChange={() => setDeliveryPlace('warehouse')}
              className='mr-2'
            />
            <Home size={20} className='mr-1' /> Pickup
          </label>
        </div>
        {deliveryPlace === 'custom' && (
          <div className={`mb-4 ${isAddressHighlighted ? 'bg-yellow-100 p-2 rounded' : ''}`}>
            <label htmlFor='deliveryAddress' className='block mb-1'>
              Delivery Address
            </label>
            <Autocomplete
              id='deliveryAddress'
              ref={deliveryAddressRef}
              className='w-full p-2 border rounded'
              apiKey={VITE_GOOGLE_MAPS_API_KEY}
              onPlaceSelected={(place) => handlePlaceSelect(place as Place)}
              options={{
                componentRestrictions: { country: 'au' },
                types: ['address'] // restrict to cities
              }}
              defaultValue={bookingInfo.delivery_to}
            />
          </div>
        )}
      </div>
      <div className='mb-6 bg-gray-50 p-6 rounded-lg shadow-lg'>
        <h2 className='text-xl font-semibold mb-2'>Order Summary</h2>
        <div className='space-y-2'>
          <p>
            <strong>Subtotal:</strong> ${calculateSubTotalPrice().toFixed(2)}
          </p>
          {surcharge > 0 && (
            <p className='text-red-500'>
              <strong>Out of hours surcharge:</strong> ${surcharge.toFixed(2)}
            </p>
          )}
          {
            deliveryPlace == 'custom' && (<p>
              <strong>Delivery Cost:</strong> ${deliveryCost}
            </p>)
          }
          <p>
            <strong>Total:</strong> $
            {(calculateTotalPrice() + (deliveryPlace === 'custom' ? 0 : 0)).toFixed(2)}
          </p>
          <h2>
            <strong>Taxes :</strong>
          </h2>
          {displayTaxByName(deliveryPlace)}
        </div>
      </div>
      <button
        onClick={handleProceedToCheckout}
        className='w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600'
        disabled={cart.length === 0}
      >
        Proceed to Checkout
      </button>
    </div>
  )
}

export default Cart
