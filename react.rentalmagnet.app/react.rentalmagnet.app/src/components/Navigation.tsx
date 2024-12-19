import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ShoppingCart } from 'lucide-react'

interface NavigationProps {
  cartItemCount: number
}

const Navigation: React.FC<NavigationProps> = ({ cartItemCount }) => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className='fixed top-0 left-0 right-0 z-50 bg-white shadow-md'>
      <div className='container mx-auto px-4 py-3 flex justify-between items-center'>
        {location.pathname !== '/' ? (
          <button
            onClick={() => navigate(-1)}
            className='text-blue-500 hover:text-blue-700 transition-colors duration-200'
          >
            <ArrowLeft size={54} />
          </button>
        ) : (
          // Increased from w-9 to w-[54px] to match the new button size
          <div className='w-[54px]'></div>
        )}
        <button
          onClick={() => navigate('/cart')}
          className='text-blue-500 hover:text-blue-700 transition-colors duration-200 relative'
        >
          <ShoppingCart size={54} />
          {cartItemCount > 0 && (
            <span className='absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-8 w-8 flex items-center justify-center'>
              {cartItemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export default Navigation
