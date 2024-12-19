import { useState } from "react";
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '../pages/styles/check.css'
interface ModalProps {
    isOpen: boolean
    onClose: () => void
    cofirmClick: (e : boolean) => void
}
const SetConfirmTerm: React.FC<ModalProps> = ({ isOpen, onClose, cofirmClick }) => {
    const closeModal = () => {
        onClose()
    }
    const [generalTerm, setGeneralTerm] = useState('false')
    const [payment, setPayment] = useState('false')
    const [delivery, setDelivery] = useState('false')
    const [responsible, setResponsible] = useState('false')
    const checkGeneralTerm = () => {
        setGeneralTerm('true')
    }
    const checkPayment = () => {
        setPayment('true')
    }
    const checkDelivery = () => {
        setDelivery('true')
    }
    const checkResponsible = () => {
        setResponsible('true')
    }

    const confirmTerm = () => {
        if (generalTerm == 'false'|| payment== 'false' || delivery== 'false' || responsible== 'false') {
            toast.warn(
                <div>
                    Input correct terms
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
        } else {
            cofirmClick(true)
        }
    }
    return (isOpen &&
        <div className="relative">
           <div className="fixed  inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <ToastContainer className="toast-position"/>
            {/* Modal */}
            <div className="bg-white rounded-lg shadow-lg w-11/12 sm:w-3/6 p-6 max-h-[90vh] overflow-y-auto mt-9">
                {/* Modal Header */}
                <div className="text-lg font-semibold text-center text-green-700">
                    Terms of Hire - Please agree to all statements to proceed.
                </div>

                {/* Modal Body */}
                <div className="mt-4 space-y-4">
                    {/* GENERAL TERMS */}
                    <div className="flex items-start space-x-2">
                        <input
                            type="checkbox"
                            id="general-terms"
                            onClick={checkGeneralTerm}
                            className=" mb-0.5 w-3.4 h-5 text-green-600 border-gray-300 rounded focus:ring focus:ring-green-300"
                        />
                        <label htmlFor="general-terms" className="text-sm leading-none">
                            <strong>GENERAL TERMS</strong> I have read and understand the{' '}
                            <a href="#" className="text-blue-600 underline">
                                Terms and Conditions
                            </a>
                            .
                        </label>
                    </div>

                    {/* BOOKING PAYMENT */}
                    <div className="flex items-start  space-x-2">
                        <input
                            type="checkbox"
                            id="booking-payment"
                            onClick={checkPayment}
                            className="mb-0.5 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring focus:ring-green-300"
                        />
                        <label htmlFor="booking-payment" className="text-sm leading-none">
                            <strong>BOOKING PAYMENT</strong> My minimum payment made today reserves the
                            equipment. I agree to commit to hiring the goods and services listed in this
                            contract from 'NT Entertainment Solutions Pty Ltd' (The Hirer) for the time
                            period specified in my booking.<br /> If I change my mind (cancel) or do not
                            finalize the payment by the 'Due Date' listed in this booking, the Hirer may
                            withdraw the services. Any amount paid may be retained to offset past, current,
                            or future incurred costs, including loss of hire opportunity for the goods and
                            services booked.<br />
                            <a href="#" className="text-blue-600 underline">
                                Covid Conditions re payment
                            </a>
                            . If my booking must be postponed due to a local government order preventing
                            the holding of my event, I can postpone to a new date within 18 months of the
                            original booking with no change in fees.<br />
                            <strong>IMPORTANT</strong> - Event attendees, family, friends, or presenters
                            from interstate or overseas locations unable to attend my event is at my own
                            risk. It is my responsibility to ensure travel arrangements are fully compliant
                            with current restrictions and this booking will go ahead as planned and agreed.
                        </label>
                    </div>

                    {/* DELIVERY */}
                    <div className="flex items-start space-x-2">
                        <input
                            type="checkbox"
                            id="delivery"
                            onClick={checkDelivery}
                            className=" w-5 h-5 text-green-600 border-gray-300 rounded focus:ring focus:ring-green-300"
                        />
                        <label htmlFor="delivery" className="text-sm">
                            <strong>DELIVERY</strong> Our delivery service does not include any set up of
                            equipment unless an item specifically states otherwise. Set up and pack up will
                            be made ready for collection at the agreed time in the same location as
                            delivery was made.
                        </label>
                    </div>

                    {/* I AM RESPONSIBLE */}
                    <div className="flex items-start space-x-2">
                        <input
                            type="checkbox"
                            id="responsible"
                            onClick={checkResponsible}
                            className=" w-5 h-5 text-green-600 border-gray-300 rounded focus:ring focus:ring-green-300"
                        />
                        <label htmlFor="responsible" className="text-sm">
                            <strong>I AM RESPONSIBLE</strong> It is my responsibility to prevent malicious
                            damage to all hired equipment. I understand I may be charged for repair,
                            cleaning, or replacement of any hired items if they are lost, excessively dirty,
                            or damaged by misuse.<br /> Equipment set up by our staff will remain in place
                            and must not be used at another location unless authorized unless there is
                            danger of damage or theft.
                        </label>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmTerm}
                        className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-300"
                    >
                        Confirm
                    </button>
                </div>
            </div>
          </div>
        </div>
    );
};

export default SetConfirmTerm;
