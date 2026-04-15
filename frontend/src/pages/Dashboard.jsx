import { useState, useEffect } from 'react';
import { Users, IndianRupee, Clock, FileText } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    totalPending: 0,
    recentBills: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const statCards = [
    { name: 'Total Customers', value: metrics.totalCustomers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Revenue', value: `₹${metrics.totalRevenue}`, icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Pending Payments', value: `₹${metrics.totalPending}`, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-card overflow-hidden shadow rounded-xl border border-border">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">{stat.name}</dt>
                    <dd className="text-2xl font-semibold text-gray-900 dark:text-foreground">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bills Table */}
      <div className="bg-white dark:bg-card shadow rounded-xl border border-border mb-6">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <FileText className="w-5 h-5 mr-2" /> Recent Bills
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-gray-50 dark:bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-card divide-y divide-border">
              {metrics.recentBills.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-muted-foreground">No recent bills found.</td>
                </tr>
              ) : (
                metrics.recentBills.map((bill) => (
                  <tr key={bill._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                      {bill.customer?.name || 'Unknown'} <span className="text-xs text-muted-foreground ml-1">({bill.customer?.fatherName})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      ₹{bill.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bill.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
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

export default Dashboard;
