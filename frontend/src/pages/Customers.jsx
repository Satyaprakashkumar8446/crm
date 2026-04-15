import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../services/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '', fatherName: '', address: '', city: '', pincode: '', age: ''
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/customers?keyword=${searchTerm}&pageNumber=${page}`);
      setCustomers(data.customers);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, page]);

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setCurrentCustomer(customer);
      setFormData(customer);
    } else {
      setCurrentCustomer(null);
      setFormData({ name: '', fatherName: '', address: '', city: '', pincode: '', age: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCustomer) {
        await api.put(`/customers/${currentCustomer._id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      handleCloseModal();
      fetchCustomers();
    } catch (error) {
      console.error('Failed to save customer', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        fetchCustomers();
      } catch (error) {
        console.error('Failed to delete customer', error);
      }
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Customers</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Customer
        </button>
      </div>

      <div className="bg-white dark:bg-card shadow rounded-lg border border-border p-4">
        <div className="flex items-center max-w-md bg-gray-50 dark:bg-muted border border-border rounded-md px-3 py-2">
          <Search className="w-5 h-5 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search customers..."
            className="bg-transparent border-none outline-none w-full text-foreground"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-gray-50 dark:bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Father Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">City/Pincode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-card divide-y divide-border">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center">Loading...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center">No customers found.</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{c.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{c.fatherName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{c.city} - {c.pincode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{c.age}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleOpenModal(c)} className="text-primary hover:text-primary/80 mr-3">
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="flex justify-between items-center mt-4">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-lg shadow-xl w-full max-w-md items-center mx-auto overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-lg font-medium">{currentCustomer ? 'Edit Customer' : 'Add Customer'}</h3>
              <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                <input required type="text" className="w-full border rounded p-2 bg-transparent" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Father Name</label>
                <input required type="text" className="w-full border rounded p-2 bg-transparent" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Address</label>
                <input required type="text" className="w-full border rounded p-2 bg-transparent" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">City</label>
                  <input required type="text" className="w-full border rounded p-2 bg-transparent" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Pincode</label>
                  <input required type="text" className="w-full border rounded p-2 bg-transparent" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Age</label>
                <input required type="number" className="w-full border rounded p-2 bg-transparent" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border rounded text-muted-foreground">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
