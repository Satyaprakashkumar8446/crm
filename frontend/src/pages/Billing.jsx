import { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, CheckCircle } from 'lucide-react';
import api from '../services/api';

const Billing = () => {
  const [customers, setCustomers] = useState([]);
  
  // Customization
  const [customerMode, setCustomerMode] = useState('existing'); // 'existing' or 'new'
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '', fatherName: '', address: '', city: '', pincode: '', age: ''
  });
  
  const [medicines, setMedicines] = useState([{ name: '', quantity: 1, price: 0 }]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const [status, setStatus] = useState('Paid');
  const [expectedPaymentDate, setExpectedPaymentDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [generatedBill, setGeneratedBill] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await api.get('/customers?limit=1000'); 
        setCustomers(data.customers);
      } catch (error) {
        console.error('Failed to load customers', error);
      }
    };
    fetchCustomers();
  }, [customerMode]); // Refetch if toggled back to existing just in case

  useEffect(() => {
    const total = medicines.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.price)), 0);
    setTotalAmount(total);
  }, [medicines]);

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveMedicine = (index) => {
    const newMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(newMedicines);
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (medicines.some(m => !m.name)) return alert('Medicine names cannot be empty');
    
    setLoading(true);
    try {
      let finalCustomerId = selectedCustomer;

      // Handle New Customer Creation inline
      if (customerMode === 'new') {
        const { data: createdCustomer } = await api.post('/customers', newCustomer);
        finalCustomerId = createdCustomer._id;
      } else if (!finalCustomerId) {
        alert('Please select a customer');
        setLoading(false);
        return;
      }

      const payload = {
        customer: finalCustomerId,
        medicines,
        status,
        expectedPaymentDate: status === 'Unpaid' ? expectedPaymentDate : null
      };
      
      const { data: createdBill } = await api.post('/bills', payload);
      
      // Fetch full bill details with populated customer for the print view
      const { data: fullBill } = await api.get(`/bills/${createdBill._id}`);
      setGeneratedBill(fullBill);
      
      // Reset form
      setSelectedCustomer('');
      setNewCustomer({ name: '', fatherName: '', address: '', city: '', pincode: '', age: '' });
      setCustomerMode('existing');
      setMedicines([{ name: '', quantity: 1, price: 0 }]);
      setStatus('Paid');
      setExpectedPaymentDate('');
    } catch (error) {
      console.error('Failed to create bill', error);
      alert('Error creating bill');
    } finally {
      setLoading(false);
    }
  };

  if (generatedBill) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow mt-8 print:shadow-none print:m-0 print:p-0 print:absolute print:inset-0 print:bg-white text-gray-800">
        <div className="text-center border-b-2 border-gray-200 pb-6 mb-6">
          <h1 className="text-4xl font-extrabold uppercase tracking-widest text-primary">City Medical Store</h1>
          <p className="text-sm text-gray-500 mt-1">123 Health Ave, Wellness City</p>
          <div className="mt-6 flex justify-center">
             <div className="text-xl font-bold tracking-[0.3em] border-2 border-gray-800 px-6 py-2 uppercase rounded print:border-black">Invoice / Bill</div>
          </div>
        </div>
        
        <div className="flex justify-between mb-8">
          <div className="bg-gray-50 p-4 rounded-lg w-1/2 mr-4 print:bg-transparent print:p-0">
            <h3 className="font-bold text-gray-700 uppercase text-xs mb-2 tracking-wider">Billed To:</h3>
            <p className="font-semibold text-lg">{generatedBill.customer.name}</p>
            <p className="text-sm text-gray-600">S/o: {generatedBill.customer.fatherName}</p>
            <p className="text-sm text-gray-600">{generatedBill.customer.address}</p>
            <p className="text-sm text-gray-600">{generatedBill.customer.city} - {generatedBill.customer.pincode}</p>
          </div>
          <div className="text-right w-1/2">
            <div className="space-y-1">
              <p className="text-sm"><span className="font-semibold text-gray-500">Bill No:</span> <span className="font-medium">#{generatedBill._id.slice(-6).toUpperCase()}</span></p>
              <p className="text-sm"><span className="font-semibold text-gray-500">Date:</span> <span className="font-medium">{new Date(generatedBill.createdAt).toLocaleDateString()}</span></p>
              <p className="text-sm">
                <span className="font-semibold text-gray-500">Status:</span> 
                <span className={`font-bold ml-1 ${generatedBill.status === 'Paid' ? 'text-green-600' : 'text-red-500'}`}>
                  {generatedBill.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        <table className="w-full text-left border-collapse mb-8 rounded-lg overflow-hidden border border-gray-200">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 border-b text-sm font-semibold">Medicine Description</th>
              <th className="p-3 border-b text-sm font-semibold text-right w-24">Qty</th>
              <th className="p-3 border-b text-sm font-semibold text-right w-32">Rate (₹)</th>
              <th className="p-3 border-b text-sm font-semibold text-right w-32">Total (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {generatedBill.medicines.map((med, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 text-sm">{med.name}</td>
                <td className="p-3 text-sm text-right">{med.quantity}</td>
                <td className="p-3 text-sm text-right">{(med.price).toFixed(2)}</td>
                <td className="p-3 text-sm text-right font-medium">{(med.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-10">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{generatedBill.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 font-bold text-xl text-primary border-b-2 border-gray-900 border-dashed">
              <span>Grand Total</span>
              <span>₹{generatedBill.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 text-sm text-gray-500 print:text-black">
          <p>Thank you for choosing City Medical Store!</p>
          <p>Wishing you a speedy recovery.</p>
        </div>

        <div className="flex gap-4 justify-center mt-12 print:hidden border-t pt-8">
            <button 
              onClick={() => setGeneratedBill(null)} 
              className="px-6 py-2.5 border border-border shadow-sm rounded-lg hover:bg-gray-50 transition-colors bg-white font-medium text-gray-700"
            >
              Create Another Bill
            </button>
            <button 
              onClick={() => window.print()} 
              className="px-6 py-2.5 bg-primary text-white rounded-lg shadow-md hover:bg-primary/90 transition-colors flex items-center font-medium"
            >
              <Printer className="w-5 h-5 mr-2" /> Print Bill
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto print:hidden">
      <div className="flex justify-between items-center bg-white dark:bg-card p-6 rounded-lg shadow-sm border border-border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Generate New Bill <CheckCircle className="text-green-500 w-5 h-5 hidden" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create a new invoice for existing or new customers.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-card shadow rounded-lg border border-border p-6 space-y-8">
        
        {/* Customer Selection Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-lg font-semibold">Customer Details</h2>
            <div className="flex bg-gray-100 dark:bg-muted p-1 rounded-lg shadow-inner">
              <button 
                type="button" 
                onClick={() => setCustomerMode('existing')} 
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${customerMode === 'existing' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Existing Customer
              </button>
              <button 
                type="button" 
                onClick={() => setCustomerMode('new')} 
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${customerMode === 'new' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                New Customer
              </button>
            </div>
          </div>

          {customerMode === 'existing' ? (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Select Existing Customer</label>
              <select 
                required
                className="w-full border rounded-lg p-3 bg-transparent text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">-- Choose a customer --</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name} (S/o {c.fatherName}) - {c.city}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-muted/30 p-5 rounded-lg border border-border">
              <div className="md:col-span-2 text-sm font-medium text-primary mb-2 flex items-center gap-2">
                <Plus className="w-4 h-4"/> Entering New Customer
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                <input required type="text" placeholder="John Doe" className="w-full border rounded-lg p-2.5 bg-white dark:bg-card" value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Father's Name</label>
                <input required type="text" placeholder="Richard Doe" className="w-full border rounded-lg p-2.5 bg-white dark:bg-card" value={newCustomer.fatherName} onChange={(e) => setNewCustomer({...newCustomer, fatherName: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                <input required type="text" placeholder="123 Main St, Appts" className="w-full border rounded-lg p-2.5 bg-white dark:bg-card" value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">City</label>
                <input required type="text" placeholder="Mumbai" className="w-full border rounded-lg p-2.5 bg-white dark:bg-card" value={newCustomer.city} onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Pincode</label>
                  <input required type="text" placeholder="400001" className="w-full border rounded-lg p-2.5 bg-white dark:bg-card" value={newCustomer.pincode} onChange={(e) => setNewCustomer({...newCustomer, pincode: e.target.value})} />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Age</label>
                  <input required type="number" min="0" placeholder="30" className="w-full border rounded-lg p-2.5 bg-white dark:bg-card" value={newCustomer.age} onChange={(e) => setNewCustomer({...newCustomer, age: e.target.value})} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Medicines List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-lg font-semibold">Medicines</h2>
            <button 
              type="button" 
              onClick={handleAddMedicine}
              className="text-sm font-medium flex items-center text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Medicine
            </button>
          </div>
          
          <div className="space-y-3">
            {medicines.map((med, index) => (
              <div key={index} className="flex gap-3 items-end bg-gray-50 dark:bg-muted/50 p-4 rounded-lg border border-border transition-all">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Medicine Name</label>
                  <input 
                    required type="text" placeholder="Paracetamol 500mg"
                    className="w-full border rounded-lg p-2.5 bg-white dark:bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={med.name} onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Qty</label>
                  <input 
                    required type="number" min="1"
                    className="w-full border rounded-lg p-2.5 bg-white dark:bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={med.quantity} onChange={(e) => handleMedicineChange(index, 'quantity', e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Price / Unit (₹)</label>
                  <input 
                    required type="number" min="0" step="0.01"
                    className="w-full border rounded-lg p-2.5 bg-white dark:bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={med.price} onChange={(e) => handleMedicineChange(index, 'price', e.target.value)}
                  />
                </div>
                <div className="w-28 bg-gray-200 dark:bg-gray-800 p-2.5 rounded-lg text-center text-sm font-bold flex items-center justify-center h-[42px] border border-transparent shadow-inner">
                  ₹{(med.quantity * med.price).toFixed(2)}
                </div>
                <button 
                  type="button" onClick={() => handleRemoveMedicine(index)}
                  disabled={medicines.length === 1}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200 p-2.5 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent h-[42px] transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Payment & Submit Section */}
        <div className="bg-gray-50 dark:bg-muted/30 p-6 rounded-xl border border-border grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Payment Status</label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${status === 'Paid' ? 'border-primary' : 'border-gray-400 group-hover:border-primary'}`}>
                    {status === 'Paid' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                  </div>
                  <input type="radio" className="hidden" name="status" value="Paid" checked={status === 'Paid'} onChange={() => setStatus('Paid')} />
                  <span className={`font-medium ${status === 'Paid' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Paid</span>
                </label>
                <label className="flex items-center cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${status === 'Unpaid' ? 'border-primary' : 'border-gray-400 group-hover:border-primary'}`}>
                    {status === 'Unpaid' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                  </div>
                  <input type="radio" className="hidden" name="status" value="Unpaid" checked={status === 'Unpaid'} onChange={() => setStatus('Unpaid')} />
                  <span className={`font-medium ${status === 'Unpaid' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Unpaid</span>
                </label>
              </div>
            </div>

            {status === 'Unpaid' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Expected Payment Date</label>
                <input 
                  required type="date"
                  className="w-full border rounded-lg p-2.5 bg-white dark:bg-card focus:ring-2 focus:ring-primary/20 outline-none"
                  value={expectedPaymentDate} onChange={(e) => setExpectedPaymentDate(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="bg-primary/5 rounded-xl border border-primary/20 p-6 flex flex-col justify-center items-center md:items-end text-center md:text-right shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Amount</span>
            <span className="text-5xl font-black text-primary tracking-tight">₹{totalAmount.toFixed(2)}</span>
            
            <button 
              type="submit" disabled={loading}
              className="mt-6 w-full py-3.5 px-6 rounded-lg font-bold text-white bg-primary hover:bg-primary/95 focus:ring-4 focus:ring-primary/30 disabled:opacity-60 transition-all shadow-md flex justify-center items-center"
            >
              {loading ? (
                 <span className="flex items-center gap-2">
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...
                 </span>
              ) : 'Save & Generate Bill'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Billing;
