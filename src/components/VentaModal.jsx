import React, { useState, useEffect } from 'react';
import { FaTimes, FaCreditCard, FaMoneyBillWave, FaWallet, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

export default function VentaModal({ isOpen, onClose, total, onConfirm }) {
  const [medioPago, setMedioPago] = useState('efectivo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isSubmitting) {
      const timer = setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        
        const successTimer = setTimeout(() => {
          onClose();
          setIsSuccess(false);
        }, 2000);

        return () => clearTimeout(successTimer);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isSubmitting, onClose]);

  if (!isOpen) return null;

  const mediosPago = [
    { 
      value: 'efectivo', 
      label: 'Efectivo', 
      icon: FaMoneyBillWave, 
      activeBorder: 'border-green-500',
      activeBg: 'bg-green-50',
      activeText: 'text-green-600',
      inactiveText: 'text-gray-400'
    },
    { 
      value: 'debito', 
      label: 'Débito', 
      icon: FaCreditCard, 
      activeBorder: 'border-blue-500',
      activeBg: 'bg-blue-50',
      activeText: 'text-blue-600',
      inactiveText: 'text-gray-400'
    },
    { 
      value: 'credito', 
      label: 'Crédito', 
      icon: FaCreditCard, 
      activeBorder: 'border-purple-500',
      activeBg: 'bg-purple-50',
      activeText: 'text-purple-600',
      inactiveText: 'text-gray-400'
    },
    { 
      value: 'mercado_pago', 
      label: 'Mercado Pago', 
      icon: FaWallet, 
      activeBorder: 'border-teal-500',
      activeBg: 'bg-teal-50',
      activeText: 'text-teal-600',
      inactiveText: 'text-gray-400'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    onConfirm({ medio_pago: medioPago, total });
  };

  return (  
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Confirmar Venta</h2>
              <p className="text-gray-600 mt-1">Complete los detalles del pago</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isSubmitting || isSuccess}
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>
        
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-green-600 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Venta Exitosa!</h3>
            <p className="text-gray-600">La transacción se ha completado correctamente</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Total */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-900 font-medium">Total a pagar</p>
                  <p className="text-3xl font-bold text-blue-900">${total.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            {/* Selección de medio de pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Seleccione forma de pago
              </label>
              <div className="grid grid-cols-2 gap-3">
                {mediosPago.map((option) => {
                  const Icon = option.icon;
                  const isActive = medioPago === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMedioPago(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isActive 
                          ? `${option.activeBorder} ${option.activeBg} shadow-sm` 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <Icon 
                          className={`text-xl mb-2 ${isActive ? option.activeText : option.inactiveText}`} 
                        />
                        <span className={`font-medium text-sm ${
                          isActive ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <FaArrowLeft />
                Volver
              </button>
              <button
                type="submit"
                className={`flex-1 px-6 py-3 text-white rounded-xl font-medium transition-all ${
                  isSubmitting 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Procesando...
                  </div>
                ) : (
                  'Confirmar Venta'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}