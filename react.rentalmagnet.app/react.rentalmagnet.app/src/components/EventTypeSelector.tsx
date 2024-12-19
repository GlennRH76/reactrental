import React from 'react'

const eventTypes = [
  'Wedding',
  'Birthday',
  'Corporate Event',
  'Graduation',
  'Baby Shower',
  'Retirement Party',
  'Holiday Celebration'
]

interface EventTypeSelectorProps {
  onSelect: (eventType: string) => void
}

const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({ onSelect }) => {
  return (
    <div className='mb-6'>
      <h2 className='text-xl font-semibold mb-2'>Select Event Type</h2>
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4'>
        {eventTypes.map((type) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className='bg-white border border-gray-300 rounded-lg py-2 px-4 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  )
}

export default EventTypeSelector
