import React from 'react'
import { ThumbsUp, ThumbsDown, Heart } from 'lucide-react'

interface PreferenceButtonsProps {
  productId: string
  handlePreference: (productId: string, preference: 'like' | 'dislike' | 'love') => void
}

const PreferenceButtons: React.FC<PreferenceButtonsProps> = ({ productId, handlePreference }) => {
  return (
    <div className='flex space-x-2'>
      <button
        className='text-gray-500 hover:text-red-500 transition-colors duration-200'
        onClick={() => handlePreference(productId, 'dislike')}
        title='Not relevant - Show less like this'
      >
        <ThumbsDown size={20} />
      </button>
      <button
        className='text-gray-500 hover:text-blue-500 transition-colors duration-200'
        onClick={() => handlePreference(productId, 'like')}
        title='Like - Show more like this'
      >
        <ThumbsUp size={20} />
      </button>
      <button
        className='text-gray-500 hover:text-pink-500 transition-colors duration-200'
        onClick={() => handlePreference(productId, 'love')}
        title='Love - Add to cart and remove from list'
      >
        <Heart size={20} />
      </button>
    </div>
  )
}

export default PreferenceButtons
