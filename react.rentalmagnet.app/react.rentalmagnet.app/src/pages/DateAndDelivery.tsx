import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Home, Calendar } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  addDays,
  parse,
  set,
  format,
  differenceInHours,
  isAfter,
  setHours,
  setMinutes,
  addHours
} from 'date-fns'
import Autocomplete from 'react-google-autocomplete'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { api } from '../services/api'
import { Place, DateAndDeliveryProps, BookingInfo } from '../interface'
import './styles/custom-date-picker.css'
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const VITE_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
interface UnavailableDateType {
  unavaliable_date: string; // or Date if the value is already a Date
}
const DateAndDelivery: React.FC<DateAndDeliveryProps> = ({
  setStartDate,
  setEndDate,
  setDeliveryPlace,
  setHireDuration,
  setDeliveryDistance,
  datesArray,
}) => {
  const navigate = useNavigate()
  const [localStartDate, setLocalStartDate] = useState<Date>(
    setMinutes(setHours(addHours(new Date(), 36), 14), 0) // Set default to 2 days from now at 2:00 PM
  )
  const [localEndDate, setLocalEndDate] = useState<Date | null>(
    setHours(setMinutes(addHours(new Date(), 60), 0), 10) // Set default to 3 days from now at 10:00 AM
  )
  const [deliveryPlace, setLocaldeliveryPlace] = useState<'custom' | 'warehouse'>('custom')
  const [surcharge, setSurcharge] = useState(0)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false)
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<string>('')
  const [bookingInfo, setBookingInfo] = useState<BookingInfo>()
  const [unAvilableDay, setUnAvailableDay] = useState<Date[]>([])
    const [chargeDays, setChargeDays] = useState([])
  const [initialState, setInitialState] = useState({
    collectionDate: '',
    deliveryDate: '',
    deliveryPlace: ``,
    delivery_to: ''
  })
  const [deliverySurcharge, setDeliverySurcharge] = useState(0)
  const [collectionSurcharge, setCollectionSurcharge] = useState(0)
  const deliveryAddressRef = useRef<HTMLInputElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [interval, setInterval] = useState(60)
  const [bussinessDay, setBussinessDay] = useState([])
  // const [bussinessEndDay, setBussinessEndDay] = useState([]);
  const formatDate = (date: Date) => {
    return format(date, "MMM do yyyy 'at' h:mm a")
  }
  const [maxDistance, setMaxDistance] = useState(60)
  useEffect(() => {
    // Define an async function to fetch data
    const fetchDeliverySettings = async () => {
      const multiplierTimeline = (await api.getMultiplierTimeline()).data
      setChargeDays(multiplierTimeline)
      try {
        const CONST_DELIVERY_SETTINGS = (await api.getSystemDelivery()).data
        setMaxDistance(CONST_DELIVERY_SETTINGS.max_delivery_travel)
      } catch (error) {
        console.error('Error fetching delivery settings:', error)
      }
    }
    // Call the async function
    fetchDeliverySettings()
  }, [])
  useEffect(() => {
    let unAvailableTemp: any = []
    Object.values(JSON.parse(localStorage.getItem('availableDays') ?? '{}').unavaliableDates as UnavailableDateType[]).map( obj  => {
      const unavailableDate = new Date(obj.unavaliable_date);  // Create a Date object
      unavailableDate.setDate(unavailableDate.getDate() + 1); // Increment the date by 1 day
      unAvailableTemp.push(unavailableDate);  // Push the next day to unAvailableTemp
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setUnAvailableDay(unAvailableTemp)
    const temp: any = []
    if (localStartDate != null) {
      datesArray.map((dateT) => {
        temp.push(dateT[days[localStartDate.getDay()].toLowerCase()])
      })
      setBussinessDay(temp)
      display()
    }
  }, [localStartDate, localEndDate, isStartDatePickerOpen ])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const temp: any = []
    if (localEndDate != null) {
      datesArray.map((dateT) => {
        temp.push(dateT[days[localEndDate.getDay()].toLowerCase()])
      })
      setBussinessDay(temp)
      display()
    }
  }, [localStartDate, localEndDate, isEndDatePickerOpen])
  ////////charge_able days
  const calculateHireDuration = (): number | undefined => {
    if (localStartDate && localEndDate) {
      let h_days = 0
      const hours = differenceInHours(localEndDate, localStartDate)
      h_days = chargeDays[hours]
      if (hours > 168) {
        h_days = 1.5 + Math.ceil((hours - 40) / 24) * 0.5
      }
      return Number(h_days)
    }
  }

  const validateDates = () => {
    if (!localStartDate || !localEndDate) {
      setValidationError('Please select both start and end dates.')
      return false
    }
    if (!isAfter(localEndDate, localStartDate)) {
      setValidationError('End date must be after start date.')
      return false
    }
    setValidationError(null)
    return true
  }

  const calculateSurcharge = () => {
    let totalSurCharge = 0
    if (localStartDate) {
      const startHour = localStartDate.getHours()
      const startDate = new Date(localStartDate)
      const startCharge = datesDetect(startDate, startHour.toString()) // Ensure startHour is a string
      totalSurCharge += (isNaN(startCharge) ? 0 : startCharge)
      setDeliverySurcharge(isNaN(startCharge) ? 0 : startCharge)
    }
    if (localEndDate) {
      const endHour = localEndDate.getHours()
      const endDate = new Date(localEndDate)
      const endCharge = datesDetect(endDate, endHour.toString())
      totalSurCharge += (isNaN(endCharge) ? 0 : endCharge) // Ensure endHour is a string
      setCollectionSurcharge(isNaN(endCharge) ? 0 : endCharge)

    }
    setSurcharge(totalSurCharge)
  }

  const datesDetect = (date: Date, hour: string): number => {
    const dayOfWeek = days[date.getDay()].toLocaleLowerCase()
    const foundDate = datesArray.find((dates) => dates.bday_id == Number(hour) + 1)
    if (foundDate) {
      const temp = foundDate[dayOfWeek]
      // Get the value for that day
      return Number(temp) // Return the numeric value
    }
    return 0
  }

  useEffect(() => {
    const localStorageInfo = localStorage.getItem('bookingInfo')
    if (localStorageInfo) {
      const localValue = JSON.parse(localStorage.getItem('bookingInfo') ?? '{}')
      setInitialState(localValue)
    }
  }, [bookingInfo])

  useEffect(() => {
    if (initialState) {
      const dateFormat = "MMM do yyyy 'at' h:mm a" // The format of your stored date strings
      if (initialState.deliveryDate) {
        const parsedStartDate = parse(initialState.deliveryDate, dateFormat, new Date())
        if (!isNaN(parsedStartDate.getTime())) {
          setLocalStartDate(parsedStartDate)
        } else {
          console.error('Invalid deliveryDate:', initialState.deliveryDate)
        }
      }

      if (initialState.collectionDate) {
        const parsedEndDate = parse(initialState.collectionDate, dateFormat, new Date())
        if (!isNaN(parsedEndDate.getTime())) {
          setLocalEndDate(parsedEndDate)
        } else {
          console.error('Invalid collectionDate:', initialState.collectionDate)
        }
      }
      if (initialState.deliveryPlace) setLocaldeliveryPlace(deliveryPlace)
      if (initialState.delivery_to) {
        setSelectedPlace(initialState.delivery_to)
      }
    }
  }, [initialState])
  useEffect(() => {
    if (localStartDate && localEndDate) {
      calculateSurcharge()
      validateDates()
    }
  }, [localStartDate, localEndDate])

  const handleStartDateChange = (date: Date) => {
    setLocalStartDate(date)
    display()
    setIsStartDatePickerOpen(false)
    if (date && (!localEndDate || !isAfter(localEndDate, date))) {
      setLocalEndDate(set(addDays(date, 1), { hours: 10, minutes: 0, seconds: 0 }))
    }
  }

  const handleEndDateChange = (date: Date | null) => {
    setLocalEndDate(date)
    setIsEndDatePickerOpen(false)
  }
  const handleContinue = async () => {
    if (validateDates()) {
      const hireDuration = calculateHireDuration()
      setStartDate(formatDate(localStartDate!))
      setEndDate(formatDate(localEndDate!))
      setDeliveryPlace(deliveryPlace)
      setHireDuration(hireDuration == undefined ? 0 : hireDuration)
      try {
        const distance = (await api.getDistance(selectedPlace)).data
        const payload: BookingInfo = {
          deliveryDate: formatDate(localStartDate!),
          collectionDate: formatDate(localEndDate!),
          deliveryPlace: deliveryPlace == 'custom' ? 'custom' : 'warehouse',
          delivery_to: selectedPlace,
          chargeable_days: hireDuration == undefined ? 0 : hireDuration,
          surCharge: surcharge,
          delivery_surcharge: deliverySurcharge,
          collection_surcharge: collectionSurcharge,
          distance: distance.distance,
          maxDistance: maxDistance
        }
        localStorage.setItem('bookingInfo', JSON.stringify(payload))
        setBookingInfo(payload)
        setDeliveryDistance(distance.distance)
        if (deliveryPlace !== 'custom' || maxDistance > distance.distance) {
          navigate('/inventory')
        } else {
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
        }
      } catch (error) {
        console.error('Error sending data to backend:', error)
      }
    }
  }

  const handlePlaceSelect = (place: Place) => {
    if (place && place.formatted_address) {
      setSelectedPlace(place.formatted_address)
    }
  }

  const startDateClicked = () => {
    setIsStartDatePickerOpen(true)
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
    <div className='space-y-6'>
      <style>
        {`
          .react-datepicker__time-list-item::after {
            margin-left: 10px
          }
        ${display()}
        `}
      </style>
      <h2 className='text-xl font-bold'>Select Date and Delivery Option</h2>
      <ToastContainer />
      <div className='space-y-4'>
        <div>
          <label htmlFor='startDate' className='block mb-1'>
            Start Date and Time
          </label>
          <div className='relative'>
            <button
              onClick={() => startDateClicked()}
              className='w-full p-2 border rounded flex items-center justify-between'
            >
              {localStartDate ? formatDate(localStartDate) : 'Select start date'}
              <Calendar size={20} />
            </button>
            {isStartDatePickerOpen && (
              <div className=" absolute z-10 mt-4 flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <DatePicker
                  selected={localStartDate}
                  timeIntervals={interval}
                  excludeDates={unAvilableDay}
                  onChange={(date) => handleStartDateChange(date as Date)}
                  showTimeSelect
                  dateFormat='MMM d, yyyy h:mm aa'
                  inline
                  minDate={new Date(new Date().setHours(new Date().getHours() + 36))}
                  onClickOutside={() => {
                    setIsStartDatePickerOpen(false)
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div>
          <label htmlFor='endDate' className='block mb-1'>
            End Date and Time
          </label>
          <div className='relative'>
            <button
              onClick={() => setIsEndDatePickerOpen(true)}
              className='w-full p-2 border rounded flex items-center justify-between'
            >
              {localEndDate ? formatDate(localEndDate) : 'Select end date'}
              <Calendar size={20} />
            </button>
            {isEndDatePickerOpen && (
              <div className='absolute z-10 mt-1 bg-white border rounded shadow-lg'>
                <DatePicker
                  selected={localEndDate}
                  excludeDates={unAvilableDay}
                  onChange={handleEndDateChange}
                  timeIntervals={interval}
                  showTimeSelect
                  dateFormat='MMM d, yyyy h:mm aa'
                  inline
                  onClickOutside={() => {
                    setIsEndDatePickerOpen(false)
                  }}
                  minDate={localStartDate ? addDays(localStartDate, 1) : new Date()}
                // timeClassName={(time) => highlightSurchargeTime(time) ? "text-red-500" : ""}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {validationError && <div className='text-red-500'>{validationError}</div>}
      <div className='space-y-2'>
        <label className='block font-medium'>Delivery Option</label>
        <div className='flex space-x-4'>
          <label className='flex items-center'>
            <input
              type='radio'
              value='delivery'
              checked={deliveryPlace === 'custom'}
              onChange={() => setLocaldeliveryPlace('custom')}
              className='mr-2'
            />
            <Truck size={20} className='mr-1' /> Delivery
          </label>
          <label className='flex items-center'>
            <input
              type='radio'
              value='pickup'
              checked={deliveryPlace === 'warehouse'}
              onChange={() => setLocaldeliveryPlace('warehouse')}
              className='mr-2'
            />
            <Home size={20} className='mr-1' /> Pickup
          </label>
        </div>
      </div>
      {deliveryPlace === 'custom' && (
        <div className='relative'>
          <label htmlFor='address' className='block mb-1'>
            Delivery Address
          </label>
          <Autocomplete
            className='w-full p-2'
            apiKey={VITE_GOOGLE_MAPS_API_KEY}
            ref={deliveryAddressRef}
            onPlaceSelected={(place) => handlePlaceSelect(place as Place)}
            onChange={(e) => setSelectedPlace((e.target as HTMLInputElement).value)}
            value={selectedPlace}
            options={{
              componentRestrictions: { country: 'au' },
              types: ['address'] // restrict to cities
            }}
          />
        </div>
      )}
      {surcharge > 0 && (
        <div className='text-red-500'>Out of hours surcharge: ${surcharge.toFixed(2)}</div>
      )}
      <button
        onClick={handleContinue}
        className='w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600'
        disabled={!!validationError}
      >
        Continue
      </button>
    </div>
  )
}

export default DateAndDelivery
