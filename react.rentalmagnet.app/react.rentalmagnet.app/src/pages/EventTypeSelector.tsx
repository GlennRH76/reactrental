import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// import { eventCategories } from '../mockData/rentalItems';

interface category {
  category_id: string
  title: string
  count: string
}

interface EventTypeSelectorProps {
  setEventType: (eventType: string) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCategories: () => Promise<any>
}

const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({ setEventType, getCategories }) => {
  const navigate = useNavigate()
  const [eventCategories, setEventCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories()
        setEventCategories(response?.data?.categories)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // Alert on notify err
        setEventCategories([])
      }
    }
    fetchCategories()
  }, [])

  const handleSelect = (category_id: string) => {
    setEventType(category_id)
    navigate(`/date-delivery`)
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold'>Choose Event Type</h2>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
        {eventCategories.map((cat: category) => (
          <button
            key={cat.category_id}
            className='p-4 bg-white rounded-lg shadow text-center hover:bg-blue-500 hover:text-white transition-colors duration-200'
            onClick={() => handleSelect(cat.category_id)}
          >
            {cat.title}
          </button>
        ))}
      </div>
    </div>
  )
}
export default EventTypeSelector
