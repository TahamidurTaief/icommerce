
// ===================================================================
// app/account/orders/[orderNumber]/page.js

"use client";
import { useEffect, useState } from 'react';
import { getOrderDetails } from '@/app/lib/api';
import Image from 'next/image';

export default function OrderDetailPage({ params }) {
    const { orderNumber } = params;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getOrderDetails(orderNumber).then(data => {
            if (data && !data.error) setOrder(data);
            setLoading(false);
        });
    }, [orderNumber]);

    if (loading) return <div className="text-center p-10">Loading order details...</div>;
    if (!order) return <div className="text-center p-10">Order not found.</div>;

    const latestUpdate = order.updates[0];

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Order #{order.order_number}</h1>
            <p className="text-muted-foreground mb-6">Placed on {new Date(order.ordered_at).toLocaleString()}</p>

            <div className="mb-8 p-4 border rounded-lg">
                <h2 className="text-xl font-bold mb-4">Tracking</h2>
                <div className="relative pl-6">
                    {/* Timeline line */}
                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border"></div>
                    {order.updates.map((update, index) => (
                        <div key={update.id} className="relative mb-6">
                            <div className={`absolute -left-1.5 top-1.5 w-4 h-4 rounded-full ${index === 0 ? 'bg-primary ring-4 ring-primary/20' : 'bg-border'}`}></div>
                            <p className="font-semibold capitalize">{update.status.toLowerCase().replace('_', ' ')}</p>
                            <p className="text-sm">{update.notes}</p>
                            <p className="text-xs text-muted-foreground">{new Date(update.timestamp).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Items in this order</h2>
                    <div className="space-y-4">
                        {order.items.map(item => (
                            <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                                <Image src={item.product.thumbnail_url} alt={item.product.name} width={80} height={80} className="rounded-md" />
                                <div className="flex-grow">
                                    <p className="font-semibold">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    {item.color && <p className="text-sm text-muted-foreground">Color: {item.color.name}</p>}
                                    {item.size && <p className="text-sm text-muted-foreground">Size: {item.size.name}</p>}
                                </div>
                                <p className="font-semibold">${item.unit_price}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold mb-4">Shipping Details</h2>
                        <div className="p-4 border rounded-lg">
                            <p className="font-semibold">{order.shipping_method.name}</p>
                            {/* Display address details here */}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-4">Payment Summary</h2>
                        <div className="p-4 border rounded-lg space-y-2">
                            <div className="flex justify-between"><span>Subtotal</span><span>${/* Calculate subtotal */}</span></div>
                            <div className="flex justify-between"><span>Shipping</span><span>${order.shipping_method.price}</span></div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total</span><span>${order.total_amount}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
