import { AppThunk } from './store'
import { RentalItem } from './types'
import { addRentalItem } from './actions'

export const fetchRentalItems = (): AppThunk => async (dispatch) => {
  const response = await fetch('/api/rental-items')
  const data: RentalItem[] = await response.json()
  data.forEach((item) => {
    dispatch(addRentalItem(item))
  })
}
