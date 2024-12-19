import axios from 'axios'
import { GetInventoryParamType } from '../interface'

const API_URL = import.meta.env.VITE_API_URL
export const api = {
  getMultiplierTimeline:() => axios.get(`${API_URL}Main/getMultiplierTimeline`),
  getBusinessDays: () => axios.get(`${API_URL}Main/getBusinessDays`),
  getCategories: () => axios.get(`${API_URL}Main/getCategories`),
  getInventory: (params: GetInventoryParamType) => axios.post(`${API_URL}Main/loadGallery`, params),
  getProducts: () => axios.get(`${API_URL}Main/getProducts`),
  getProduct: (id: string) => axios.get(`${API_URL}Main/products/${id}`),
  getDistance: (delivery_to: string) =>
    axios.get(`${API_URL}Main/getDistances`, { params: { delivery_to } }),
  getSystemDelivery: () => axios.get(`${API_URL}Main/getSystemDelivery`),
  getTaxTypes: () => axios.get(`${API_URL}Main/getTaxTypes`),
  getAvailableDays: () => axios.get(`${API_URL}Main/getBookingAvaliableDates`),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveBookingInfo: (data: any) =>
    axios.post(`${API_URL}Main/saveBookingInfo`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
}
