import React from 'react'

interface CartItem {
  id: string
  name: string
  price: number
}

interface CartProps {
  items: CartItem[]
  onRemoveItem: (itemId: string) => void
}

const Cart: React.FC<CartProps> = ({ items, onRemoveItem }) => {
  const total = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className='bg-white rounded-lg shadow-md p-4 mb-6'>
      <h2 className='text-xl font-semibold mb-2'>Your Cart</h2>
      {items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ul className='divide-y divide-gray-200'>
            {items.map((item) => (
              <li key={item.id} className='py-2 flex justify-between items-center'>
                <span>{item.name}</span>
                <div>
                  <span className='mr-2'>${item.price.toFixed(2)}</span>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className='text-red-500 hover:text-red-700'
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className='mt-4 text-right'>
            <p className='text-lg font-bold'>Total: ${total.toFixed(2)}</p>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart
