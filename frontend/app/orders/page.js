// app/account/orders/page.js
"use client";
import { useEffect, useState } from 'react';
import { getUserOrders } from '@/app/lib/api';
import Link from 'next/link';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // NOTE: This requires user authentication to be implemented.
        getUserOrders().then(data => {
            if (data && !data.error) setOrders(data.results || []);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-center p-10">Loading your orders...</div>;

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">My Orders</h1>
            <div className="space-y-4">
                {orders.length > 0 ? orders.map(order => (
                    <Link href={`/account/orders/${order.order_number}`} key={order.id} className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <p className="font-bold text-primary">Order #{order.order_number.slice(0, 8)}...</p>
                                <p className="text-sm text-muted-foreground">Placed on: {new Date(order.ordered_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-lg">${order.total_amount}</p>
                                <p className="text-sm font-medium capitalize px-2 py-1 rounded-full bg-blue-100 text-blue-800">{order.status.toLowerCase()}</p>
                            </div>
                        </div>
                    </Link>
                )) : <p>You have no past orders. Time to start shopping!</p>}
            </div>
        </div>
    );
}