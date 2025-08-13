'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeCheck,
  Calendar,
  Package,
  DollarSign,
  X,
  Truck,
  ListChecks,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { getUserOrders } from '@/app/lib/api.js';

export default function OrderListDisplay() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { isAuthenticated, openAuthModal, user } = useAuth();

  useEffect(() => {
    let ignore = false;
    async function fetchOrders() {
      setIsLoading(true);
      try {
        if (!isAuthenticated || !user?.id) {
          setIsLoading(false);
          return;
        }
        // Fetch only orders for the current user
        const data = await getUserOrders(user.id);
        if (!ignore) setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!ignore) console.error('Failed to fetch orders.', err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    fetchOrders();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  // Status color mapping
  const statusColor = {
    PENDING: 'bg-yellow-400',
    PROCESSING: 'bg-blue-500',
    SHIPPED: 'bg-accent-green',
    DELIVERED: 'bg-accent-green',
    CANCELLED: 'bg-red-500',
  };

  // Order progress steps
  const statusSteps = [
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ];

  function OrderProgressTracker({ status }) {
    const currentIdx = statusSteps.indexOf(status);
    return (
      <div className="flex items-center gap-2 my-4">
        {statusSteps.map((step, idx) => (
          <React.Fragment key={step}>
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 ${
              idx < currentIdx
                ? 'bg-accent-green border-accent-green text-white'
                : idx === currentIdx
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-[var(--color-background)] border-border text-text-secondary'
            }`}>
              {step[0]}
            </div>
            {idx < statusSteps.length - 1 && (
              <div className={`flex-1 h-1 ${
                idx < currentIdx
                  ? 'bg-accent-green'
                  : 'bg-border'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  function TrackingHistory({ updates }) {
    return (
      <motion.ul
        className="flex flex-col gap-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12 },
          },
        }}
      >
        {updates && updates.length > 0 ? (
          updates.map((update, idx) => (
            <motion.li
              key={idx}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="flex items-start gap-3"
            >
              <ListChecks className="text-accent mt-1" size={18} />
              <div>
                <div className="font-medium text-sm">
                  {update.status}
                  <span className="ml-2 text-xs text-text-secondary">
                    {format(new Date(update.timestamp), 'PPpp')}
                  </span>
                </div>
                {update.notes && (
                  <div className="text-xs text-text-secondary mt-0.5">{update.notes}</div>
                )}
              </div>
            </motion.li>
          ))
        ) : (
          <div className="text-text-secondary text-sm">No tracking updates yet.</div>
        )}
      </motion.ul>
    );
  }

  // Card for each order
  function OrderCard({ order }) {
    return (
      <motion.div
        className="bg-[var(--color-second-bg)] rounded-lg p-4 border border-border flex flex-col gap-2 shadow-sm"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <BadgeCheck size={18} className="text-accent" />
          <span className="font-mono text-sm">{order.order_number}</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary text-xs">
          <Calendar size={15} />
          <span>{format(new Date(order.ordered_at), 'PPpp')}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Package size={15} />
          <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${statusColor[order.status] || 'bg-gray-400'}`}>{order.status}</span>
        </div>
        {order.total_amount && (
          <div className="flex items-center gap-2 text-text-secondary text-xs mt-1">
            <DollarSign size={15} />
            <span>Total:</span>
            <span className="font-semibold text-text-primary">${parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
        )}
        <button
          className="mt-2 flex items-center gap-2 bg-button-primary text-white px-3 py-1.5 rounded hover:opacity-90 transition text-sm self-start"
          onClick={() => setSelectedOrder(order)}
        >
          <Truck size={16} /> Track Order
        </button>
      </motion.div>
    );
  }

  // UI rendering
  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-background)] text-text-primary">
        <div className="bg-[var(--color-second-bg)] border border-border rounded-lg p-8 shadow-md flex flex-col items-center gap-4">
          <div className="text-lg font-semibold">Please log in to view your orders.</div>
          <button
            className="bg-button-primary text-white px-6 py-2 rounded hover:opacity-90 transition text-base font-medium"
            onClick={() => openAuthModal('login')}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Only show orders for the logged-in user (if backend returns all orders, filter by user id)
  // All orders fetched are already user-specific
  const currentOrders = Array.isArray(orders)
    ? orders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING')
    : [];
  const previousOrders = Array.isArray(orders)
    ? orders.filter((o) =>
        o.status === 'SHIPPED' ||
        o.status === 'DELIVERED' ||
        o.status === 'CANCELLED')
    : [];

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-text-primary py-8 px-2">
      <div className="max-w-4xl mx-auto flex flex-col gap-10">
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Truck size={22} className="text-accent" /> Current Orders
          </h2>
          {currentOrders.length === 0 ? (
            <div className="text-text-secondary">No current orders.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {currentOrders.map((order) => (
                <OrderCard key={order.order_number} order={order} />
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package size={22} className="text-accent" /> Previous Orders
          </h2>
          {previousOrders.length === 0 ? (
            <div className="text-text-secondary">No previous orders.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {previousOrders.map((order) => (
                <OrderCard key={order.order_number} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tracking Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
            />
            {/* Modal Content */}
            <motion.div
              className="relative z-10 bg-[var(--color-second-bg)] rounded-lg p-8 max-w-lg w-full border border-border shadow-xl flex flex-col gap-4"
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <button
                className="absolute top-3 right-3 text-text-secondary hover:text-text-primary"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close"
              >
                <X size={22} />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <BadgeCheck className="text-accent" size={20} />
                <span className="font-mono text-base">{selectedOrder.order_number}</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary text-xs mb-2">
                <Calendar size={15} />
                <span>{format(new Date(selectedOrder.ordered_at), 'PPpp')}</span>
              </div>
              <OrderProgressTracker status={selectedOrder.status} />

              {/* Products in this Order */}
              <div className="mt-2">
                <h3 className="font-semibold mb-2 flex items-center gap-1 text-base">
                  <Package size={18} className="text-accent" /> Products
                </h3>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {selectedOrder.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-4 py-2">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.product_name}
                            className="w-12 h-12 object-cover rounded border border-border bg-white"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.product_name}</div>
                          <div className="text-xs text-text-secondary">Qty: {item.quantity}</div>
                        </div>
                        <div className="text-sm font-semibold text-text-primary">
                          ${parseFloat(item.unit_price).toFixed(2)}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-text-secondary text-sm">No products found for this order.</div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Package size={15} />
                <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${statusColor[selectedOrder.status] || 'bg-gray-400'}`}>{selectedOrder.status}</span>
              </div>
              {selectedOrder.total_amount && (
                <div className="flex items-center gap-2 text-text-secondary text-xs mt-1">
                  <DollarSign size={15} />
                  <span>Total:</span>
                  <span className="font-semibold text-text-primary">${parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="mt-4">
                <h3 className="font-semibold mb-2 flex items-center gap-1 text-base">
                  <ListChecks size={18} className="text-accent" /> Tracking History
                </h3>
                <TrackingHistory updates={selectedOrder.updates || []} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
