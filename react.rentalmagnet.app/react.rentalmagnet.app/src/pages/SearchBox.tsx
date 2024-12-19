import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from 'react-modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as freeSolidSvgIcons from '@fortawesome/free-solid-svg-icons'
import './styles/Modal.css'
import { Product } from '../interface'

// Set up the accessibility requirements for react-modal
Modal.setAppElement('#root') // Ensure this matches your root app element

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  data: Product[]
}

const imageUrl = import.meta.env.VITE_IMAGE_URL

const SearchBox: React.FC<ModalProps> = ({ isOpen, onClose, data }) => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filteredData, setFilteredData] = useState<Product[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
    }
    filterItems()
  }, [searchTerm, isOpen])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filterItems = () => {
    if (searchTerm) {
      const filtered = data.filter((item) => {
        return (
          item.public === "1" &&
          item.active === "1" &&
          (item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
      setFilteredData(filtered)
    } else {
      setFilteredData([])
    }
  }

  // Update here: Correctly pass productId, no need for 'product'
  const handleNavigateToProduct = (
    event: React.MouseEvent<HTMLDivElement | HTMLImageElement>,
    productId: string
  ) => {
    event.stopPropagation() // Stop event propagation to prevent conflicts with the modal
    navigate(`/product/${productId}`, { state: filteredData }) // Navigate to the product page
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel='Product Search Modal'
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark background
          zIndex: 1000
        },
        content: {
          top: '10%', // Adjust this if you want to move it lower
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, 0)',
          width: '80%',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '8px',
          padding: '0'
        }
      }}
    >
      <div className='modal-header'>
        <h2 className='keyword-text'>Type your keyword</h2>
        <button className='close-btn' onClick={onClose}>
          X
        </button>
      </div>
      <div className='modal-body'>
        <div className='search-box'>
          <input
            type='text'
            className='search-input'
            placeholder='Search Product...'
            value={searchTerm}
            onChange={handleSearch}
            autoFocus
          />
          <button className='search-btn'>
            <FontAwesomeIcon icon={freeSolidSvgIcons.faSearch} />
          </button>
        </div>

        {/* Render the filtered search results */}
        <div className='search-results'>
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <div
                key={`${item.item_id}-${index}`}
                className='product-card p-1'
                onClick={(e) => handleNavigateToProduct(e, item.item_id)} // Pass product ID here
              >
                {/* Clicking the image should also trigger the navigation */}
                <img
                  src={imageUrl + item.thumbnails.split(',')[0]}
                  alt={item.title}
                  className='product-image'
                  onClick={(e) => handleNavigateToProduct(e, item.item_id)} // Pass product ID here
                />
                <h3 className='text-lg font-semibold cursor-pointer'>{item.title}</h3>
                <p className='text-sm text-gray-600 mb-2'>
                  {item.description.substring(0, 100)}...
                </p>
                <div className='flex justify-between items-center'>
                  <p className='text-lg font-bold'>from ${item.price} / day</p>
                  <p className='text-sm text-gray-600'>Available: {item.quantity}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No products found</p>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default SearchBox
