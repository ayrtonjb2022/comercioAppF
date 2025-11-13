import React, { useState, useEffect } from 'react';
import { FaTimes, FaCreditCard, FaMoneyBillWave, FaWallet, FaCheckCircle } from 'react-icons/fa';

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

  const getIconoMedioPago = () => {
    switch(medioPago) {
      case 'efectivo':
        return <FaMoneyBillWave className="text-green-600 text-xl" />;
      case 'debito':
        return <FaCreditCard className="text-blue-600 text-xl" />;
      case 'credito':
        return <FaCreditCard className="text-purple-600 text-xl" />;
      case 'mercado_pago':
        return <FaWallet className="text-teal-600 text-xl" />;
      default:
        return <FaMoneyBillWave className="text-xl" />;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Confirmar Venta</h2>
            <p className="text-sm text-gray-600 mt-1">Complete los detalles del pago</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isSubmitting || isSuccess}
          >
            <FaTimes />
          </button>
        </div>
        
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-green-600 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">¡Venta Exitosa!</h3>
            <p className="text-gray-600">La transacción se ha completado correctamente</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Total */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-2xl text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-100 text-sm">Total a pagar</p>
                  <p className="text-3xl font-bold">${total.toFixed(2)}</p>
                </div>
                <div className="text-blue-100 text-right">
                  <p className="text-sm">Medio de pago</p>
                  <p className="font-medium">{getNombreMedioPago()}</p>
                </div>
              </div>
            </div>
            
            {/* Selección de medio de pago */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">Seleccione forma de pago</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'efectivo', label: 'Efectivo', icon: FaMoneyBillWave, color: 'green' },
                  { value: 'debito', label: 'Débito', icon: FaCreditCard, color: 'blue' },
                  { value: 'credito', label: 'Crédito', icon: FaCreditCard, color: 'purple' },
                  { value: 'mercado_pago', label: 'Mercado Pago', icon: FaWallet, color: 'teal' }
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMedioPago(option.value)}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                        medioPago === option.value 
                          ? `border-${option.color}-500 bg-${option.color}-50 shadow-md` 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`text-${option.color}-600 text-xl mb-2`} />
                      <span className="font-medium text-sm">{option.label}</span>
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
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`flex-1 px-6 py-3 text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
                  isSubmitting 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
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
        )}
      </div>
    </div>
  );
}