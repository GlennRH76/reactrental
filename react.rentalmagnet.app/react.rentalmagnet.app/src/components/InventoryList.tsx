import React, { useState, useEffect } from 'react'
import { Heart, ThumbsUp, X } from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  description: string
  price: number
  image: string
}

interface InventoryListProps {
  eventType: string
  onAddToCart: (item: InventoryItem) => void
}

const InventoryList: React.FC<InventoryListProps> = ({ eventType, onAddToCart }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [userPreferences, setUserPreferences] = useState<
    Record<string, 'like' | 'love' | 'ignore'>
  >({})

  useEffect(() => {
    // Fetch inventory based on event type
    // This is a mock implementation. Replace with actual API call to your CodeIgniter backend
    const fetchInventory = async () => {
      // Simulated API call
      const response = await fetch(`/api/inventory?eventType=${eventType}`)
      const data = await response.json()
      setInventory(data)
    }

    fetchInventory()
  }, [eventType])

  const handlePreference = (itemId: string, preference: 'like' | 'love' | 'ignore') => {
    setUserPreferences({ ...userPreferences, [itemId]: preference })
    // Send preference to backend for better recommendations
    // Implement API call to your CodeIgniter backend
  }

  const sortedInventory = inventory.sort((a, b) => {
    const aPreference = userPreferences[a.id] || ''
    const bPreference = userPreferences[b.id] || ''
    if (aPreference === 'love' && bPreference !== 'love') return -1
    if (bPreference === 'love' && aPreference !== 'love') return 1
    if (aPreference === 'like' && bPreference !== 'like') return -1
    if (bPreference === 'like' && aPreference !== 'like') return 1
    return 0
  })

  return (
    <div className='mb-6'>
      <h2 className='text-xl font-semibold mb-2'>Available Items</h2>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {sortedInventory.map((item) => (
          <div key={item.id} className='bg-white rounded-lg shadow-md p-4'>
            <img
              src={item.image}
              alt={item.name}
              className='w-full h-48 object-cover rounded-md mb-2'
            />
            <h3 className='text-lg font-semibold'>{item.name}</h3>
            <p className='text-sm text-gray-600 mb-2'>{item.description}</p>
            <p className='text-lg font-bold mb-2'>${item.price.toFixed(2)}</p>
            <div className='flex justify-between items-center'>
              <button
                onClick={() => onAddToCart(item)}
                className='bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600'
              >
                Add to Cart
              </button>
              <div className='flex space-x-2'>
                <button
                  onClick={() => handlePreference(item.id, 'like')}
                  className='text-gray-500 hover:text-blue-500'
                >
                  <ThumbsUp size={20} />
                </button>
                <button
                  onClick={() => handlePreference(item.id, 'love')}
                  className='text-gray-500 hover:text-red-500'
                >
                  <Heart size={20} />
                </button>
                <button
                  onClick={() => handlePreference(item.id, 'ignore')}
                  className='text-gray-500 hover:text-gray-700'
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InventoryList
