import React, { useState, useEffect } from 'react';
import { FaTimes, FaCreditCard, FaMoneyBillWave, FaWallet } from 'react-icons/fa';

export default function VentaModal({ isOpen, onClose, total, onConfirm }) {
  const [medioPago, setMedioPago] = useState('efectivo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isSubmitting) {
      const timer = setTimeout(() => {
        onClose();
        setIsSubmitting(false); 
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSubmitting, onClose]);

  if (!isOpen) return null;

  const getIconoMedioPago = () => {
    switch(medioPago) {
      case 'efectivo':
        return <FaMoneyBillWave className="text-green-600 mr-2" />;
      case 'debito':
        return <FaCreditCard className="text-blue-600 mr-2" />;
      case 'credito':
        return <FaCreditCard className="text-purple-600 mr-2" />;
      case 'mercado_pago':
        return <FaWallet className="text-teal-600 mr-2" />;
      default:
        return <FaMoneyBillWave className="mr-2" />;
    }
  };

  const getNombreMedioPago = () => {
    switch(medioPago) {
      case 'efectivo': return 'Efectivo';
      case 'debito': return 'Tarjeta Débito';
      case 'credito': return 'Tarjeta Crédito';
      case 'mercado_pago': return 'Mercado Pago';
      default: return medioPago;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    onConfirm({ medio_pago: medioPago, total });
  };

  return (  
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center border-b p-5">
          <h2 className="text-xl font-bold text-gray-800">Confirmar Venta</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            disabled={isSubmitting}
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total a pagar</p>
                <p className="text-2xl font-bold text-blue-800">${total.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Forma de pago</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMedioPago('efectivo')}
                className={`flex items-center justify-center p-3 rounded-xl border ${
                  medioPago === 'efectivo' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FaMoneyBillWave className="text-green-600 mr-2" />
                <span>Efectivo</span>
              </button>
              
              <button
                type="button"
                onClick={() => setMedioPago('debito')}
                className={`flex items-center justify-center p-3 rounded-xl border ${
                  medioPago === 'debito' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FaCreditCard className="text-blue-600 mr-2" />
                <span>Débito</span>
              </button>
              
              <button
                type="button"
                onClick={() => setMedioPago('credito')}
                className={`flex items-center justify-center p-3 rounded-xl border ${
                  medioPago === 'credito' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FaCreditCard className="text-purple-600 mr-2" />
                <span>Crédito</span>
              </button>
              
              <button
                type="button"
                onClick={() => setMedioPago('mercado_pago')}
                className={`flex items-center justify-center p-3 rounded-xl border ${
                  medioPago === 'mercado_pago' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FaWallet className="text-teal-600 mr-2" />
                <span>Mercado Pago</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-white rounded-lg flex items-center gap-2 transition ${
                isSubmitting 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                'Confirmar Venta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}