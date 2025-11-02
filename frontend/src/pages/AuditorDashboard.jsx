import { useState, useEffect } from 'react';
import { useVerifyEvidence } from '../hooks/useVerifyEvidence';
import toast from 'react-hot-toast';
import axios from 'axios';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Search, 
  Download, 
  ExternalLink, 
  Trash2,
  Filter,
  Calendar,
  Hash,
  FileText,
  Eye,
  X,
  Truck,
  User,
  MapPin,
  RefreshCw
} from 'lucide-react';

export default function AuditorDashboard() {
  const { getVerificationHistory, deleteFromHistory, clearHistory } = useVerifyEvidence();
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, valid, invalid
  const [selectedItem, setSelectedItem] = useState(null); // Para el modal de detalles
  const [trips, setTrips] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [activeTab, setActiveTab] = useState('trips'); // trips, evidence, history

  useEffect(() => {
    loadHistory();
    loadTrips();
    loadEvidence();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [history, searchTerm, filterStatus]);

  const loadHistory = () => {
    const data = getVerificationHistory();
    setHistory(data);
  };

  const loadTrips = async () => {
    try {
      setLoadingTrips(true);
      const response = await axios.get('/api/trips');
      if (response.data.success) {
        setTrips(response.data.trips || []);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
      toast.error('Error al cargar viajes');
    } finally {
      setLoadingTrips(false);
    }
  };

  const loadEvidence = async () => {
    try {
      setLoadingEvidence(true);
      const response = await axios.get('/api/evidence/all');
      if (response.data.success) {
        setEvidence(response.data.records || []);
      }
    } catch (error) {
      console.error('Error loading evidence:', error);
      toast.error('Error al cargar evidencias');
    } finally {
      setLoadingEvidence(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...history];

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.recordId.toString().includes(term) ||
        item.licencePlate?.toLowerCase().includes(term) ||
        item.onChainHash?.toLowerCase().includes(term) ||
        item.localHash?.toLowerCase().includes(term)
      );
    }

    // Filtrar por estado
    if (filterStatus === 'valid') {
      filtered = filtered.filter(item => item.matches === true);
    } else if (filterStatus === 'invalid') {
      filtered = filtered.filter(item => item.matches === false);
    }

    setFilteredHistory(filtered);
  };

  const handleDelete = (recordId) => {
    if (confirm('¿Eliminar esta verificación del historial?')) {
      deleteFromHistory(recordId);
      loadHistory();
      toast.success('Verificación eliminada del historial');
    }
  };

  const handleClearAll = () => {
    if (confirm('¿Eliminar TODAS las verificaciones del historial? Esta acción no se puede deshacer.')) {
      clearHistory();
      loadHistory();
      toast.success('Historial limpiado');
    }
  };

  const exportToCSV = () => {
    if (filteredHistory.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const headers = ['Record ID', 'Placas', 'Fecha', 'Estado', 'Hash Blockchain', 'Hash Local', 'Red', 'Verificado'];
    const rows = filteredHistory.map(item => [
      item.recordId,
      item.licencePlate || '',
      new Date(item.timestamp).toLocaleString('es-MX'),
      item.matches ? 'Válido' : 'Alterado',
      item.onChainHash || '',
      item.localHash || '',
      item.chain || '',
      new Date(item.verifiedAt).toLocaleString('es-MX')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('CSV exportado exitosamente');
  };

  const stats = {
    total: history.length,
    valid: history.filter(h => h.matches).length,
    invalid: history.filter(h => !h.matches).length
  };

  const activeTrips = trips.filter(t => t.status === 'active');
  const totalTrips = trips.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Dashboard de Auditor
                </h1>
                <p className="text-lg text-gray-600">
                  Gestión de viajes, evidencias y verificaciones
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                loadTrips();
                loadEvidence();
                loadHistory();
                toast.success('Datos actualizados');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('trips')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'trips'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Viajes ({totalTrips})
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'evidence'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Evidencias ({evidence.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Historial ({history.length})
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Viajes Activos</p>
                <p className="text-3xl font-bold text-gray-900">{activeTrips.length}</p>
              </div>
              <Truck className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Total Evidencias</p>
                <p className="text-3xl font-bold text-gray-900">{evidence.length}</p>
              </div>
              <FileText className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Evidencias Válidas</p>
                <p className="text-3xl font-bold text-green-600">{stats.valid}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Evidencias Alteradas</p>
                <p className="text-3xl font-bold text-red-600">{stats.invalid}</p>
              </div>
              <XCircle className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Trips Tab */}
        {activeTab === 'trips' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {loadingTrips ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando viajes...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="p-12 text-center">
                <Truck className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">Sin viajes</h3>
                <p className="text-gray-500">No hay viajes registrados aún</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Trip ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Chofer</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Origen</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Destino</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Camión</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Estado</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Fecha</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {trips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-sm">{trip.id}</td>
                        <td className="px-6 py-4 font-medium">{trip.driver}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{trip.origin}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{trip.destination}</td>
                        <td className="px-6 py-4 font-semibold">{trip.truck}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            trip.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {trip.status === 'active' ? 'Activo' : 'Completado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(trip.createdAt).toLocaleDateString('es-MX')}
                        </td>
                        <td className="px-6 py-4">
                          {trip.status === 'active' && (
                            <button
                              onClick={async () => {
                                if (confirm(`¿Completar viaje ${trip.id}? El chofer ${trip.driver} quedará disponible.`)) {
                                  try {
                                    const response = await axios.put(`/api/trips/${trip.id}/complete`);
                                    if (response.data.success) {
                                      toast.success(response.data.message || 'Viaje completado');
                                      loadTrips();
                                    }
                                  } catch (error) {
                                    toast.error(error.response?.data?.error || 'Error al completar viaje');
                                  }
                                }
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-semibold"
                              title="Marcar como entregado"
                            >
                              Entregado
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Evidence Tab */}
        {activeTab === 'evidence' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {loadingEvidence ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando evidencias...</p>
              </div>
            ) : evidence.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">Sin evidencias</h3>
                <p className="text-gray-500">No hay evidencias registradas aún</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Record ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Placas</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Fecha</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Archivo</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Hash</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">IPFS CID</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {evidence.map((record) => (
                      <tr key={record.recordId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-sm font-bold">{record.recordId}</td>
                        <td className="px-6 py-4 font-semibold">{record.plate}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(record.timestamp * 1000).toLocaleString('es-MX')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.fileName}</td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-500 truncate max-w-xs">
                          {record.hash?.slice(0, 16)}...
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-500 truncate max-w-xs">
                          {record.ipfsCid}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {record.scrollExplorerUrl && (
                              <a
                                href={record.scrollExplorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                                title="Ver en Scroll"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            {record.arbitrumExplorerUrl && (
                              <a
                                href={record.arbitrumExplorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                                title="Ver en Arbitrum"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <a
                              href={`https://ipfs.io/ipfs/${record.ipfsCid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                              title="Ver en IPFS"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <>
            {/* Filters & Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por Record ID, placas o hash..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
              >
                <option value="all">Todas</option>
                <option value="valid">✓ Válidas</option>
                <option value="invalid">✗ Alteradas</option>
              </select>

              <button
                onClick={exportToCSV}
                disabled={filteredHistory.length === 0}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                Exportar CSV
              </button>

              <button
                onClick={handleClearAll}
                disabled={history.length === 0}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-5 h-5" />
                Limpiar Todo
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-4 text-gray-600 font-medium">
          Mostrando {filteredHistory.length} de {history.length} verificaciones
        </div>

        {/* History Table */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Shield className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              {history.length === 0 ? 'Sin verificaciones' : 'Sin resultados'}
            </h3>
            <p className="text-gray-500">
              {history.length === 0 
                ? 'Las verificaciones que realices aparecerán aquí' 
                : 'Intenta ajustar los filtros de búsqueda'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Record ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Placas</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Fecha Evento</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Verificado</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Red</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredHistory.map((item) => (
                    <tr key={item.recordId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        {item.matches ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            Válido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                            <XCircle className="w-4 h-4" />
                            Alterado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-gray-900">
                          #{item.recordId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">
                          {item.licencePlate}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(item.timestamp).toLocaleString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(item.verifiedAt).toLocaleString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-700">
                          {item.chain}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            title="Ver Detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {item.scrollExplorerUrl && (
                            <a
                              href={item.scrollExplorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Ver en Scroll"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {item.arbitrumExplorerUrl && (
                            <a
                              href={item.arbitrumExplorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                              title="Ver en Arbitrum"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {item.explorerUrl && (
                            <a
                              href={item.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                              title="Ver en Blockchain"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <a
                            href={`https://ipfs.io/ipfs/${item.ipfsHash?.replace('ipfs://', '') || ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                            title="Ver en IPFS"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(item.recordId)}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title="Eliminar del historial"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
          </>
        )}

        {/* Modal de Detalles */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Shield className="w-8 h-8" />
                  Detalle de Verificación
                </h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Banner */}
                <div className={`p-4 rounded-xl ${
                  selectedItem.matches 
                    ? 'bg-green-50 border-2 border-green-200' 
                    : 'bg-red-50 border-2 border-red-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {selectedItem.matches ? (
                      <>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                          <h3 className="text-xl font-bold text-green-900">✅ Evidencia 100% Original</h3>
                          <p className="text-green-700">Los hashes coinciden perfectamente</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-8 h-8 text-red-600" />
                        <div>
                          <h3 className="text-xl font-bold text-red-900">⚠️ Evidencia Alterada</h3>
                          <p className="text-red-700">El archivo no coincide con el registro blockchain</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Información Básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Record ID</label>
                    <p className="text-xl font-bold text-gray-900 font-mono">#{selectedItem.recordId}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Placas</label>
                    <p className="text-xl font-bold text-gray-900">{selectedItem.licencePlate || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Fecha del Evento</label>
                    <p className="text-base font-medium text-gray-900">
                      {new Date(selectedItem.timestamp).toLocaleString('es-MX', {
                        dateStyle: 'full',
                        timeStyle: 'long'
                      })}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Fecha de Verificación</label>
                    <p className="text-base font-medium text-gray-900">
                      {new Date(selectedItem.verifiedAt).toLocaleString('es-MX', {
                        dateStyle: 'full',
                        timeStyle: 'long'
                      })}
                    </p>
                  </div>
                </div>

                {/* Hashes */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Hash className="w-5 h-5" />
                    Comparación de Hashes SHA-256
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">
                        Hash en Blockchain:
                      </label>
                      <div className="bg-gray-100 p-3 rounded-lg font-mono text-xs break-all">
                        {selectedItem.onChainHash || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">
                        Hash Calculado (IPFS):
                      </label>
                      <div className="bg-gray-100 p-3 rounded-lg font-mono text-xs break-all">
                        {selectedItem.localHash || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blockchain Info */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Información de Blockchain</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Red:</span>
                      <span className="font-bold text-gray-900">{selectedItem.chain || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Uploader:</span>
                      <span className="font-mono text-sm text-gray-900">
                        {selectedItem.uploader ? 
                          `${selectedItem.uploader.slice(0, 6)}...${selectedItem.uploader.slice(-4)}` : 
                          'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* IPFS Info */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Almacenamiento IPFS</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">
                        IPFS Hash:
                      </label>
                      <div className="bg-white p-3 rounded-lg font-mono text-xs break-all">
                        {selectedItem.ipfsHash || 'N/A'}
                      </div>
                    </div>
                    {selectedItem.ipfsHash && (
                      <a
                        href={`https://ipfs.io/ipfs/${selectedItem.ipfsHash.replace('ipfs://', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Abrir en IPFS
                      </a>
                    )}
                  </div>
                </div>

                {/* Blockchain Links */}
                {(selectedItem.scrollExplorerUrl || selectedItem.arbitrumExplorerUrl || selectedItem.explorerUrl) && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Enlaces a Blockchain</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {selectedItem.scrollExplorerUrl && (
                        <a
                          href={selectedItem.scrollExplorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Scroll
                        </a>
                      )}
                      {selectedItem.arbitrumExplorerUrl && (
                        <a
                          href={selectedItem.arbitrumExplorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Arbitrum
                        </a>
                      )}
                      {selectedItem.explorerUrl && (
                        <a
                          href={selectedItem.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Blockchain
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* IPFS Link */}
                {selectedItem.ipfsHash && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Almacenamiento IPFS</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          IPFS Hash:
                        </label>
                        <div className="bg-white p-3 rounded-lg font-mono text-xs break-all">
                          {selectedItem.ipfsHash || 'N/A'}
                        </div>
                      </div>
                      <a
                        href={`https://ipfs.io/ipfs/${selectedItem.ipfsHash.replace('ipfs://', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Abrir en IPFS
                      </a>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
