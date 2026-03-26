import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import type { RootState } from '../../store';
import DashboardHeader from '../../components/AdminDashboard/DashboardHeader';
import StatsGrid from '../../components/AdminDashboard/StatsGrid';
import RecentOrdersTable from '../../components/AdminDashboard/RecentOrdersTable';
import FacilitiesManager from '../../components/AdminDashboard/FacilitiesManager';
import SystemStatus from '../../components/AdminDashboard/SystemStatus';
import { API } from '../../config/api';

const AdminDashboardPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [stats, setStats] = useState({ totalSales: 0, activeOrders: 0, totalProducts: 0, totalUsers: 0, recentOrders: [] });
    const [loading, setLoading] = useState(true);
    const [facilities, setFacilities] = useState({ razorpay: true, bankTransfer: true, emailNotifications: true, smsNotifications: false });

    const toggleFacility = async (key: keyof typeof facilities) => {
        const newVal = !facilities[key];
        setFacilities(prev => ({ ...prev, [key]: newVal }));
        try {
            await fetch(`${API}/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
                body: JSON.stringify({ [key]: newVal })
            });
        } catch (error) {
            setFacilities(prev => ({ ...prev, [key]: !newVal }));
        }
    };

    const handleVerifyPayment = async (orderId: string) => {
        if (!window.confirm("Verify payment for Order #" + orderId.substring(0, 8) + "?")) return;

        try {
            const res = await fetch(`${API}/orders/${orderId}/payment`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`
                },
                body: JSON.stringify({ isPaid: true })
            });

            if (res.ok) {
                // Refresh data
                const sRes = await fetch(`${API}/orders/admin/stats`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                const sData = await sRes.json();
                setStats(sData);
                toast.success("Payment verified successfully.");
            } else {
                toast.error("Failed to verify payment.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during verification.");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sRes, setRes] = await Promise.all([
                    fetch(`${API}/orders/admin/stats`, { headers: { Authorization: `Bearer ${user?.token}` } }),
                    fetch(`${API}/settings`, { headers: { Authorization: `Bearer ${user?.token}` } })
                ]);
                const sData = await sRes.json();
                setStats(sData);
                if (setRes.ok) {
                    const settings = await setRes.json();
                    setFacilities({ razorpay: settings.razorpay ?? true, bankTransfer: settings.bankTransfer ?? true, emailNotifications: settings.emailNotifications ?? true, smsNotifications: settings.smsNotifications ?? false });
                }
                setLoading(false);
            } catch (e) { setLoading(false); }
        };
        if (user) fetchData();
    }, [user]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>;

    return (
        <div className="font-sans pb-8">
            <div className="max-w-7xl mx-auto">
                <DashboardHeader />
                <StatsGrid stats={stats} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2"><RecentOrdersTable orders={stats.recentOrders} handleVerifyPayment={handleVerifyPayment} /></div>
                    <div className="space-y-8">
                        <FacilitiesManager facilities={facilities} toggleFacility={toggleFacility} />
                        <SystemStatus />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
