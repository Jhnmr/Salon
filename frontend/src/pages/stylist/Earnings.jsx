import { useState, useEffect } from 'react';
import { Card, Button, Badge, Select } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import * as paymentsService from '../../services/payments.service';

/**
 * Stylist Earnings Page
 * View earnings, transactions, and payment history
 */
const StylistEarnings = () => {
  const [earnings, setEarnings] = useState({
    lifetime: 0,
    thisMonth: 0,
    thisWeek: 0,
    pending: 0,
    released: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    loadEarnings();
    loadTransactions();
  }, [timeRange]);

  /**
   * Load earnings data
   */
  const loadEarnings = async () => {
    try {
      // Mock data - would come from API
      setEarnings({
        lifetime: 12450.50,
        thisMonth: 2840.00,
        thisWeek: 680.00,
        pending: 450.00,
        released: 2390.00,
      });
    } catch (error) {
      console.error('Failed to load earnings:', error);
    }
  };

  /**
   * Load transaction history
   */
  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await paymentsService.getPayments({ time_range: timeRange });
      setTransactions(response.data || response);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      // Mock data
      setTransactions([
        {
          id: 1,
          date: '2024-01-15',
          client: 'Sarah Wilson',
          service: 'Haircut & Color',
          amount: 120.00,
          commission: 84.00,
          status: 'released'
        },
        {
          id: 2,
          date: '2024-01-14',
          client: 'Mike Johnson',
          service: 'Hair Styling',
          amount: 60.00,
          commission: 42.00,
          status: 'pending'
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Export transactions to CSV
   */
  const handleExportCSV = () => {
    // Placeholder - would generate CSV
    alert('CSV export functionality will be implemented');
  };

  const timeRangeOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: 'year', label: 'This Year' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Earnings</h1>
            <p className="text-gray-400">Track your income and transactions</p>
          </div>
          <Button variant="secondary" onClick={handleExportCSV}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </Button>
        </div>

        {/* Earnings Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-1">
            <p className="text-gray-400 text-sm mb-1">Lifetime Earnings</p>
            <p className="text-4xl font-bold text-white mb-2">{formatCurrency(earnings.lifetime)}</p>
            <Badge variant="success">All time</Badge>
          </Card>

          <Card>
            <p className="text-gray-400 text-sm mb-1">This Month</p>
            <p className="text-3xl font-bold text-yellow-400">{formatCurrency(earnings.thisMonth)}</p>
            <p className="text-green-400 text-sm mt-2">↑ 12% from last month</p>
          </Card>

          <Card>
            <p className="text-gray-400 text-sm mb-1">This Week</p>
            <p className="text-3xl font-bold text-blue-400">{formatCurrency(earnings.thisWeek)}</p>
            <p className="text-green-400 text-sm mt-2">↑ 8% from last week</p>
          </Card>
        </div>

        {/* Payment Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-400/20 to-green-600/20 border-green-400/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-1">Released Payments</p>
                <p className="text-3xl font-bold text-green-400">{formatCurrency(earnings.released)}</p>
                <p className="text-gray-400 text-xs mt-2">Available for withdrawal</p>
              </div>
              <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border-yellow-400/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-1">Pending Payments</p>
                <p className="text-3xl font-bold text-yellow-400">{formatCurrency(earnings.pending)}</p>
                <p className="text-gray-400 text-xs mt-2">Processing</p>
              </div>
              <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Earnings Chart Placeholder */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Earnings Overview</h2>
          <div className="h-64 flex items-center justify-center bg-gray-700/30 rounded-lg">
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg">Earnings Chart</p>
              <p className="text-sm mt-2">Chart.js integration coming soon</p>
            </div>
          </div>
        </Card>

        {/* Transaction History */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Transaction History</h2>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              options={timeRangeOptions}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Commission (70%)</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 text-gray-300">{formatDate(transaction.date)}</td>
                    <td className="py-4 text-white">{transaction.client}</td>
                    <td className="py-4 text-gray-300">{transaction.service}</td>
                    <td className="py-4 text-gray-300">{formatCurrency(transaction.amount)}</td>
                    <td className="py-4 text-yellow-400 font-semibold">{formatCurrency(transaction.commission)}</td>
                    <td className="py-4">
                      <Badge variant={transaction.status === 'released' ? 'success' : 'warning'}>
                        {transaction.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400">No transactions found</p>
            </div>
          )}
        </Card>

        {/* Commission Info */}
        <Card className="mt-8 bg-blue-500/10 border-blue-500/50">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Commission Breakdown</h3>
              <p className="text-gray-300 text-sm mb-2">
                You earn 70% commission on all completed services. The platform fee is 30%.
              </p>
              <p className="text-gray-400 text-xs">
                Payments are released 7 days after service completion. You can withdraw funds once they're released.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StylistEarnings;
