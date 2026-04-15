import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import api from '../services/api';

const Payments = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'pending' ? '/payments/pending' : '/payments/completed';
      const { data } = await api.get(endpoint);
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleMarkAsPaid = async (paymentId) => {
    if (window.confirm('Mark this payment as paid?')) {
      try {
        await api.put(`/payments/${paymentId}/pay`);
        fetchPayments();
      } catch (error) {
        console.error('Failed to mark as paid', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Payment Tracking</h1>

      <div className="bg-white dark:bg-card shadow rounded-lg border border-border">
        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex -mb-px px-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center ${
                activeTab === 'pending'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <AlertCircle className="w-4 h-4 mr-2" /> Pending Payments
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center ${
                activeTab === 'completed'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Completed Payments
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-gray-50 dark:bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Bill ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {activeTab === 'pending' ? 'Expected Date' : 'Paid Date'}
                </th>
                {activeTab === 'pending' && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-card divide-y divide-border">
              {loading ? (
                <tr><td colSpan={activeTab === 'pending' ? 5 : 4} className="px-6 py-4 text-center text-sm">Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'pending' ? 5 : 4} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle className={`w-8 h-8 mb-2 ${activeTab==='pending'?'text-green-500':'text-gray-300'}`} />
                      <p>No {activeTab} payments found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {payment.customer?.name} <span className="text-muted-foreground text-xs">({payment.customer?.fatherName})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      ...{payment.bill ? payment.bill.toString().slice(-6) : 'unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
                      ₹{payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {activeTab === 'pending' 
                        ? (payment.expectedPaymentDate ? new Date(payment.expectedPaymentDate).toLocaleDateString() : 'Not Set')
                        : (payment.actualPaymentDate ? new Date(payment.actualPaymentDate).toLocaleDateString() : 'Unknown')
                      }
                    </td>
                    {activeTab === 'pending' && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleMarkAsPaid(payment._id)}
                          className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-full font-semibold transition-colors"
                        >
                          Mark Paid
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
