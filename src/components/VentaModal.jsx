import React, { useState } from 'react';

export default function VentaModal({ isOpen, onClose, total, onConfirm }) {
  const [medioPago, setMedioPago] = useState('efectivo');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ medio_pago: medioPago, total });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Confirmar Venta</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Forma de pago</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={medioPago}
              onChange={(e) => setMedioPago(e.target.value)}
            >
              <option value="efectivo">Efectivo</option>
              <option value="debito">Tarjeta Débito</option>
              <option value="credito">Tarjeta Crédito</option>
              <option value="mercado_pago">Mercado Pago</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Total</label>
            <input
              type="text"
              value={`$ ${total}`}
              disabled
              className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Confirmar Venta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
