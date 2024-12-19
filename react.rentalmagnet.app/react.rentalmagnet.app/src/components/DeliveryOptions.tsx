import React from 'react'

interface DeliveryOptionsProps {
  selectedOption: 'custom' | 'warehouse'
  onOptionChange: (option: 'custom' | 'warehouse') => void
}

const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({ selectedOption, onOptionChange }) => {
  return (
    <div className='mb-6'>
      <h2 className='text-xl font-semibold mb-2'>Delivery Options</h2>
      <div className='flex space-x-4'>
        <label className='flex items-center'>
          <input
            type='radio'
            value='delivery'
            checked={selectedOption === 'custom'}
            onChange={() => onOptionChange('custom')}
            className='mr-2'
          />
          Delivery
        </label>
        <label className='flex items-center'>
          <input
            type='radio'
            value='pickup'
            checked={selectedOption === 'warehouse'}
            onChange={() => onOptionChange('warehouse')}
            className='mr-2'
          />
          Pickup from Warehouse
        </label>
      </div>
      {selectedOption === 'custom' && (
        <div className='mt-4'>
          <label htmlFor='address' className='block mb-1'>
            Delivery Address
          </label>
          <input
            type='text'
            id='address'
            className='w-full border border-gray-300 rounded-md px-3 py-2'
            placeholder='Enter your delivery address'
          />
        </div>
      )}
    </div>
  )
}

export default DeliveryOptions
