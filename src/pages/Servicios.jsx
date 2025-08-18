// servicios.jsx
import React, { useState, useEffect } from 'react';
import { postVendas, postMovimiento } from "../api/webApi";
import { FaMobileAlt, FaLightbulb, FaHistory, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const Servicios = ({ cajaId }) => {
  // Función para obtener fecha/hora en formato ISO
  const getFechaHoraLocalISO = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - (offset * 60000)).toISOString().slice(0, 19);
  };

  const [tipoServicio, setTipoServicio] = useState('recarga');
  const [proveedor, setProveedor] = useState('');
  const [numero, setNumero] = useState('');
  const [monto, setMonto] = useState('');
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cargando, setCargando] = useState(false);

  // Proveedores comunes de Argentina
  const proveedoresRecargas = [
    "Personal",
    "Claro",
    "Movistar",
    "Tuenti",
    "Directv",
    "Cablevisión",
    "Telecentro"
  ];

  const proveedoresPagos = [
    "Ecco",
    "Edesur",
    "Edenor",
    "Metrogas",
    "Camuzzi",
    "Aysa",
    "Cooperativa Eléctrica",
    "Pampa Energía"
  ];

  // Obtener proveedores según el tipo de servicio
  const proveedores = tipoServicio === 'recarga' ? proveedoresRecargas : proveedoresPagos;

  // Efecto para establecer el primer proveedor por defecto
  useEffect(() => {
    if (proveedores.length > 0) {
      setProveedor(proveedores[0]);
    }
  }, [tipoServicio]);

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCargando(true);

    if (!proveedor || !numero || !monto) {
      setError('Por favor complete todos los campos');
      setCargando(false);
      return;
    }

    if (isNaN(parseFloat(monto))) {
      setError('El monto debe ser un número válido');
      setCargando(false);
      return;
    }

    try {
      const montoNumerico = parseFloat(monto);
      const ganancia = tipoServicio === 'pago' ? montoNumerico * 0.1 : 0;
      const total = tipoServicio === 'pago' ? montoNumerico + ganancia : montoNumerico;

      // Crear objeto de venta compatible con el backend
      const ventaCompleta = {
        fecha: getFechaHoraLocalISO(),
        total: parseFloat(total.toFixed(2)),
        cajaId: cajaId,
        medio_pago: 'efectivo',
        detalles: [{
          producto_id: 214 , // El backend permite null para servicios
          cantidad: 1,
          precio_unitario: total,
          total: total,
          descuento: 0, // Descuento siempre 0 para servicios
          // Agregar descripción como en tu ejemplo de caja
          descripcion: `${tipoServicio === 'recarga' ? 'Recarga' : 'Pago de servicio'} - ${proveedor}`
        }]
      };

      // Registrar venta - compatible con backend
      const ventaRegistrada = await postVendas(ventaCompleta);
      console.log(ventaCompleta);
      

      // Registrar movimiento
      await postMovimiento({
        tipo: "ingreso",
        monto: total,
        descripcion: tipoServicio === 'recarga' ? 
          `Recarga ${proveedor}` : `Pago servicio ${proveedor} + $${ganancia.toFixed(2)} comisión`,
        fecha: getFechaHoraLocalISO(),
        cajaId: cajaId
      });

      // Actualizar historial
      const nuevaTransaccion = {
        id: ventaRegistrada.id,
        fecha: new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        hora: new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        proveedor,
        numero,
        monto: montoNumerico,
        tipo: tipoServicio,
        total: total,
        estado: 'Completado'
      };

      setHistorial([nuevaTransaccion, ...historial]);
      setSuccess(`${tipoServicio === 'recarga' ? 'Recarga' : 'Pago'} realizado con éxito!`);
      
      // Limpiar formulario
      setNumero('');
      setMonto('');
    } catch (err) {
      console.error('Error al procesar el servicio:', err);
      
      // Mostrar mensaje de error más específico
      let errorMessage = 'Error al procesar el servicio. Intente nuevamente.';
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        if (err.response.data && err.response.data.error) {
          errorMessage += `: ${err.response.data.error}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 max-w-7xl mx-auto">
      {cargando && (
        <div className="fixed inset-0 bg-white/70 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Servicios</h1>
          <p className="text-gray-600 mt-1 md:mt-2">Recargas telefónicas y pagos de servicios</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden">
          {/* Sección de selección de servicio */}
          <div className="border-b border-gray-200 p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center gap-2">
                  {tipoServicio === 'recarga' 
                    ? <FaMobileAlt className="text-blue-500" /> 
                    : <FaLightbulb className="text-yellow-500" />}
                  {tipoServicio === 'recarga' ? 'Recargas Telefónicas' : 'Pagos de Servicios'}
                </h2>
                <p className="text-gray-600 text-sm md:text-base mt-1">
                  {tipoServicio === 'recarga' 
                    ? 'Recargá tu línea móvil al instante' 
                    : 'Pagá tus servicios con una comisión del 10%'}
                </p>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => setTipoServicio('recarga')}
                  className={`flex items-center gap-2 px-3 py-2 text-sm md:px-4 md:py-2 md:text-base rounded-lg transition ${
                    tipoServicio === 'recarga'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FaMobileAlt /> Recargas
                </button>
                <button
                  onClick={() => setTipoServicio('pago')}
                  className={`flex items-center gap-2 px-3 py-2 text-sm md:px-4 md:py-2 md:text-base rounded-lg transition ${
                    tipoServicio === 'pago'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FaLightbulb /> Pagos
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 md:mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Proveedor</label>
                  <select 
                    value={proveedor} 
                    onChange={(e) => setProveedor(e.target.value)}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {proveedores.map((prov, index) => (
                      <option key={index} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    {tipoServicio === 'recarga' ? 'Número de teléfono' : 'Número de servicio'}
                  </label>
                  <input 
                    type="tel" 
                    value={numero} 
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder={tipoServicio === 'recarga' ? "11 2345 6789" : "Número de cliente"}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Monto</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input 
                      type="number" 
                      value={monto} 
                      onChange={(e) => setMonto(e.target.value)}
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2 md:pl-10 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Resumen de transacción */}
              {monto && !isNaN(parseFloat(monto)) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4 mt-4 md:mt-6">
                  <h3 className="text-base md:text-lg font-medium text-gray-800 mb-2 md:mb-3">Resumen de Transacción</h3>
                  <div className="space-y-1 md:space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm md:text-base">Monto base:</span>
                      <span className="font-medium">${parseFloat(monto).toFixed(2)}</span>
                    </div>
                    {tipoServicio === 'pago' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm md:text-base">Comisión (10%):</span>
                          <span className="font-medium text-green-600">+${(parseFloat(monto) * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-gray-500 italic">
                          Esta comisión corresponde a nuestro servicio de gestión de pagos
                        </div>
                      </>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                      <span className="text-gray-800 font-semibold text-sm md:text-base">Total a cobrar:</span>
                      <span className="text-base md:text-lg font-bold text-blue-700">
                        ${tipoServicio === 'pago' 
                          ? (parseFloat(monto) * 1.1).toFixed(2) 
                          : parseFloat(monto).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 md:mt-6 flex justify-end">
                <button 
                  type="submit" 
                  className={`px-5 py-2.5 md:px-6 md:py-3 rounded-lg text-white font-medium transition-colors ${
                    cargando ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  } flex items-center`}
                  disabled={cargando}
                >
                  {cargando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="mr-2 text-sm md:text-base" />
                      Realizar Servicio
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-3 md:mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-start">
                  <FaExclamationTriangle className="mr-2 mt-0.5 text-red-500" />
                  <p className="text-sm md:text-base">{error}</p>
                </div>
              )}

              {success && (
                <div className="mt-3 md:mt-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded flex items-start">
                  <FaCheckCircle className="mr-2 mt-0.5 text-green-500" />
                  <p className="text-sm md:text-base">{success}</p>
                </div>
              )}
            </form>
          </div>

          {/* Sección de historial */}
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3 md:mb-4">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaHistory className="text-blue-500" /> Historial Reciente
                </h2>
                <p className="text-gray-600 text-sm md:text-base mt-1">
                  Registro de transacciones realizadas
                </p>
              </div>
              
              <span className="bg-blue-100 text-blue-800 text-xs md:text-sm font-medium px-3 py-1 rounded-full">
                {historial.filter(t => t.tipo === tipoServicio).length} registros
              </span>
            </div>

            {historial.filter(t => t.tipo === tipoServicio).length === 0 ? (
              <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg">
                <FaHistory className="mx-auto text-gray-400 text-3xl md:text-4xl mb-2" />
                <p className="text-gray-500 text-sm md:text-base">No hay transacciones registradas</p>
                <p className="text-gray-400 text-xs mt-1">Realice una transacción para ver el historial</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm md:text-base">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
                      <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                      <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Número</th>
                      <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                      {tipoServicio === 'pago' && (
                        <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
                      )}
                      <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historial
                      .filter(t => t.tipo === tipoServicio)
                      .map((trans, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap">
                            <div className="text-gray-700">{trans.fecha}</div>
                            <div className="text-gray-500 text-xs">{trans.hora}</div>
                          </td>
                          <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-gray-700">{trans.proveedor}</td>
                          <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-gray-700">{trans.numero}</td>
                          <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-gray-700">${trans.monto.toFixed(2)}</td>
                          {tipoServicio === 'pago' && (
                            <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-gray-700">${(trans.monto * 0.1).toFixed(2)}</td>
                          )}
                          <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap font-medium text-blue-700">${trans.total.toFixed(2)}</td>
                          <td className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {trans.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Servicios;