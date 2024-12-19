/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import SearchBox from './SearchBox'
import { Product, InventoryListProps, CategoryInfo } from '../interface'
// import PreferenceButtons from '../components/PreferenceButtons';
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { api } from '../services/api'
import parse from 'html-react-parser';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const imageUrl = import.meta.env.VITE_IMAGE_URL
const InventoryList: React.FC<InventoryListProps> = ({
  eventType,
  addToCart,
  // removeFromDisplayedItems,
  cart,
  hireDuration,
  displayedItems
}) => {
  const navigate = useNavigate()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchTerm] = useState('')
  const [totalProduct, setTotalProduct] = useState<Product[]>([])
  const [animatingItem, setAnimatingItem] = useState<string | null>(null)
  const [eventCategory, setEventCategorie] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [imageSlider, setImageSlider] = useState<Product[]>([]);
  // const [userPreferences, setUserPreferences] = useState<Record<string, 'like' | 'dislike' | 'love'>>({});
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        ///////////this part is to get total product from server
        const totalProduct = (await api.getProducts()).data
        setTotalProduct(totalProduct)
        const response = (await api.getCategories())
        const cat = response?.data.categories
        const temp = cat.filter((t: CategoryInfo) => t.category_id == eventType)
        setEventCategorie(temp[0]['title'])
      } catch (err) {
        // Alert on notify err
        setEventCategorie('')
      }
    }
    fetchCategories()
  }, [cart])

  const handleAddToCart = (product: Product) => {
    if (cart.findIndex((c) => c.item_id === product.item_id) !== -1) {
      toast.warn(
        <div>
          Warning.
          <br />
          Already exists in your cart
        </div>,
        {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: { backgroundColor: 'orange', color: '#fff' },
          progressStyle: { backgroundColor: '#fff' }
        }
      )
      return
    }
    setAnimatingItem(product.item_id)
    setTimeout(() => {
      addToCart(product)
      setAnimatingItem(null)
      // removeFromDisplayedItems(product.item_id);
    }, 2000)
    // Animation duration
  }
  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    transition: 'opacity 0.3s ease'
  }
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setIsModalOpen(false)
  }
  const handleNavigateToProduct = (productId: string) => {
    navigate(`/product/${productId}`)
  }

  return (
    <div className='space-y-4'>
      <ToastContainer />
      <h2 className='text-xl font-bold'>
        {eventType === 'All' ? 'All Items' : `Items for ${eventCategory}`}
      </h2>
      {/* <p className='text-gray-600'>Hire Duration: {hireDuration.toFixed(1)} days</p> */}
      <div className='relative'>
        <input
          type='text'
          placeholder='Search all items...'
          onClick={openModal}
          readOnly
          value={searchTerm}
          className='w-full p-2 pl-10 border rounded'
        />
        <Search className='absolute left-3 top-2.5 text-gray-400' size={20} />
      </div>
      <SearchBox isOpen={isModalOpen} onClose={closeModal} data={totalProduct} />
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {displayedItems.map(
          (item) =>
            item.storeQuantity != 0 && (
              <div
                key={item.item_id}
                className={`bg-white rounded-lg shadow-md p-4 ${animatingItem === item.item_id ? 'animate-add-to-cart' : ''
                  }`}
              >
                <Slider
                  infinite={item.thumbnails.split(',').length > 1} // Disable infinite scrolling for 1 image
                  slidesToShow={1}
                  slidesToScroll={1}
                  autoplay={item.thumbnails.split(',').length > 1} // Disable autoplay for 1 image
                  autoplaySpeed={2000}>
                  {item.thumbnails
                    ?.split(',')
                    .filter(Boolean) // Remove empty strings
                    .map((src, index) => (
                      <div key={index}>
                        <img className='w-full h-70px'
                          src={imageUrl + src}
                          alt={`Slide ${index}`}
                          onClick={() => handleNavigateToProduct(item.item_id)}
                        />
                      </div>
                    ))}
                </Slider>
                <h3
                  className='text-lg font-semibold cursor-pointer'
                  onClick={() => handleNavigateToProduct(item.item_id)}
                >
                  {item.title}
                </h3>
                <p className='text-sm text-gray-600 mb-2'>
                  {parse(item.description.substring(0, 100))}...
                </p>
                <div className='flex justify-between items-center'>
                  <p className='text-lg font-bold'>from ${item.price} / day</p>
                  <p className='text-sm text-gray-600'>Available: {item.storeQuantity}</p>
                </div>
                <div className='flex justify-between items-center mt-2'>
                  <input type='' id='availableQuantity' hidden value={item.storeQuantity} readOnly></input>
                  {/* <PreferenceButtons productId={item.item_id} handlePreference={handlePreference} /> */}
                  <button
                    style={{
                      ...buttonStyle,
                      backgroundColor: '#007BFF',
                      marginLeft: '10px'
                    }}
                    onClick={() => handleAddToCart(item)}
                    className={`bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 ${Number(item.storeQuantity) <= 0 ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  )
}
export default InventoryList
