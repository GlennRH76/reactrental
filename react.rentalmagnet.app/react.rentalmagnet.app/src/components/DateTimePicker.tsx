import React from 'react'
import { Calendar } from 'lucide-react'

interface DateTimePickerProps {
  startDate: Date | null
  endDate: Date | null
  onStartDateChange: (date: Date) => void
  onEndDateChange: (date: Date) => void
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) => {
  return (
    <div className='mb-6'>
      <h2 className='text-xl font-semibold mb-2'>Event Date and Time</h2>
      <div className='flex flex-col sm:flex-row sm:space-x-4'>
        <div className='flex-1 mb-4 sm:mb-0'>
          <label htmlFor='startDate' className='block mb-1'>
            Start Date and Time
          </label>
          <div className='relative'>
            <input
              type='datetime-local'
              id='startDate'
              value={startDate ? startDate.toISOString().slice(0, 16) : ''}
              onChange={(e) => onStartDateChange(new Date(e.target.value))}
              className='w-full border border-gray-300 rounded-md px-3 py-2 pl-10'
            />
            <Calendar className='absolute left-3 top-2.5 text-gray-400' size={20} />
          </div>
        </div>
        <div className='flex-1'>
          <label htmlFor='endDate' className='block mb-1'>
            End Date and Time
          </label>
          <div className='relative'>
            <input
              type='datetime-local'
              id='endDate'
              value={endDate ? endDate.toISOString().slice(0, 16) : ''}
              onChange={(e) => onEndDateChange(new Date(e.target.value))}
              className='w-full border border-gray-300 rounded-md px-3 py-2 pl-10'
            />
            <Calendar className='absolute left-3 top-2.5 text-gray-400' size={20} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DateTimePicker
