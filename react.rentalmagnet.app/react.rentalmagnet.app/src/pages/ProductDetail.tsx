import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ProductDetailProps } from '../interface'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '../index.css'
// import PreferenceButtons from '../components/PreferenceButtons';
// import { format } from 'date-fns';
const imageUrl = import.meta.env.VITE_IMAGE_URL
const ProductDetail: React.FC<ProductDetailProps> = ({
  cart,
  addToCart,
  hireDuration,
  displayedItems,
}) => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const temp = location.state || []
  const navigate = useNavigate()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [product, setProduct] = useState<any>(null)
  const [animatingItem, setAnimatingItem] = useState<string | null>(null)
  const [isFlying, setIsFlying] = useState(false);

  useEffect(() => {
    if (temp.length != 0) {
      displayedItems = temp
    }
    const foundProduct = displayedItems.find((item) => item.item_id === id)
    if (foundProduct) {
      setProduct(foundProduct)
    } else {
      navigate('/inventory') // Redirect to inventory if product not found0
    }
  }, [id, navigate])

  const handleAddToCart = () => {
    if (product) {
      if (product.quantity == 0) {
        toast.error(
          <div>
            Warning.
            <br />
            No quantity
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
        return;
      }
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
      setIsFlying(true);
      setTimeout(() => {
        addToCart(product)
        setAnimatingItem(null)
        setIsFlying(false);
        // You can add logic here to refresh similar items or navigate back to inventory
      }, 2000) // Animation duration
    }
  }

  if (!product) {
    return <div>Loading...</div>
  }
  const sanitizedDescription = DOMPurify.sanitize(product.description, {
    ALLOWED_TAGS: ['iframe', 'p', 'b', 'i', 'u', 'a', 'img'], // Add iframe and other allowed tags
    ALLOWED_ATTR: ['src', 'href', 'alt', 'width', 'height'], // Allow necessary attributes
  });

  const handleNavigateToProduct = (productId: string) => {
    navigate(`/product/${productId}`)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <ToastContainer />
      <div
        className={`p-6 bg-white shadow-lg rounded-lg transition-transform duration-300 ${animatingItem === product.item_id ? 'transform scale-105' : ''
          }`}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{product.title}</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 '>
          <div>
            <Slider
              infinite={product.thumbnails.split(',').length > 1} // Disable infinite scrolling for 1 image
              slidesToShow={1}
              slidesToScroll={1}
              autoplay={product.thumbnails.split(',').length > 1} // Disable autoplay for 1 image
              autoplaySpeed={2000}>
              {product.thumbnails
                ?.split(',')
                .filter(Boolean) // Remove empty strings
                .map((src: string, index: number) => (
                  <div key={index}>
                    <img className='w-full h-70px'
                      src={imageUrl + src}
                      alt={`Slide ${index}`}
                      onClick={() => handleNavigateToProduct(product.item_id)}
                    />
                  </div>
                ))}
            </Slider>
          </div>
          <div className='p-5'>
            <p className="text-gray-600 text-lg mb-4">{parse(sanitizedDescription)}</p>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-2xl font-semibold text-blue-600">
                  ${product.price} <span className="text-sm text-gray-500">/ day</span>
                </p>
                <p className="text-sm text-gray-500">
                  Total for {hireDuration.toFixed(1)} days: $
                  {(Number(product.price) * hireDuration).toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-gray-700 font-medium">Quantity: {product.storeQuantity}</p>
            </div>
            <div className="flex justify-end items-center">
              <button
                onClick={handleAddToCart}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
        <div>
        </div>
      </div>
    </div>
  );
}
export default ProductDetail
