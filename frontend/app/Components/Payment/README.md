# OrderPaymentModal Component

A comprehensive React modal component for handling order payment information in an e-commerce application.

## Features

- 💳 **Payment Method Selection**: Radio buttons for bKash, Nagad, and Card
- 📱 **Sender Number Input**: Customer's payment phone number
- 🔢 **Transaction ID Input**: Reference/transaction ID field
- 🔒 **Admin Account Display**: Read-only admin account number
- ✅ **Form Validation**: Real-time validation with error messages
- 🎭 **Animations**: Smooth Framer Motion transitions
- 🌓 **Dark Mode**: Full dark mode support
- 📊 **Order Summary**: Display cart items and totals
- 🔄 **Loading States**: Submit progress indicators
- ✨ **Success Feedback**: Animated success confirmation

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | boolean | ✅ | - | Controls modal visibility |
| `onClose` | function | ✅ | - | Callback when modal closes |
| `onSuccess` | function | ❌ | - | Callback when order is created successfully |
| `cartItems` | array | ❌ | `[]` | Array of cart items for the order |
| `totalAmount` | number | ❌ | `0` | Total order amount |
| `shippingMethod` | object | ❌ | `null` | Selected shipping method |
| `shippingAddress` | object | ❌ | `null` | Shipping address object |
| `adminAccountNumber` | string | ❌ | `null` | Admin account number (read-only) |
| `redirectToConfirmation` | boolean | ❌ | `true` | Auto-redirect to `/confirmation` after success |

## Usage

### Basic Usage with Auto-Redirect

```jsx
import { OrderPaymentModal } from "@/app/Components/Payment";

const [isModalOpen, setIsModalOpen] = useState(false);

<OrderPaymentModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSuccess={(result) => {
    console.log("Order created:", result);
    // User will be automatically redirected to /confirmation
  }}
/>
```

### Disable Auto-Redirect

```jsx
<OrderPaymentModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSuccess={(result) => {
    console.log("Order created:", result);
    // Handle custom navigation or actions
  }}
  redirectToConfirmation={false}
/>
```

### Complete Example with Data

```jsx
import { OrderPaymentModal } from "@/app/Components/Payment";

const cartItems = [
  {
    id: 1,
    product_id: 1,
    quantity: 2,
    price: 25.99,
    color_id: 1,
    size_id: 1
  }
];

const shippingMethod = {
  id: 1,
  name: "Standard Delivery",
  price: "5.99"
};

const shippingAddress = {
  id: 1,
  street: "123 Main St",
  city: "New York",
  // ... other address fields
};

<OrderPaymentModal
  isOpen={isModalOpen}
  onClose={handleClose}
  onSuccess={handleSuccess}
  cartItems={cartItems}
  totalAmount={57.97}
  shippingMethod={shippingMethod}
  shippingAddress={shippingAddress}
  adminAccountNumber="ADMIN-ACC-12345"
/>
```

## Navigation Flow

### Automatic Redirection

By default, after a successful order creation, the component will:

1. **Show Success Animation**: Display a 2-second success animation
2. **Store Order Data**: Save order details in `sessionStorage` 
3. **Navigate to Confirmation**: Redirect to `/confirmation` page using Next.js router
4. **Clear Storage**: The confirmation page clears the data after reading

### Confirmation Page Data

The confirmation page receives order data via `sessionStorage`:

```javascript
{
  orderId: 123,
  orderNumber: "uuid-string",
  totalAmount: 99.99,
  shippingMethod: { /* shipping details */ },
  paymentMethod: "bkash",
  transactionId: "TXN123456789"
}
```

### Custom Navigation

To handle navigation manually, set `redirectToConfirmation={false}`:

```jsx
<OrderPaymentModal
  redirectToConfirmation={false}
  onSuccess={(result) => {
    // Handle custom navigation
    router.push(`/custom-success/${result.order_id}`);
  }}
/>
```

### Input Data Structure

**Cart Items:**
```javascript
[
  {
    id: 1,
    product_id: 1,
    quantity: 2,
    price: 25.99,
    color_id: 1,
    size_id: 1
  }
]
```

**Shipping Method:**
```javascript
{
  id: 1,
  name: "Standard Delivery",
  price: "5.99"
}
```

### API Request Format

The component sends data to the backend in this format:

```javascript
{
  total_amount: 57.97,
  shipping_address: 1,
  shipping_method: 1,
  sender_number: "01712345678",
  transaction_id: "TXN123456789",
  payment_method: "bkash",
  items: [
    {
      product: 1,
      color: 1,
      size: 1,
      quantity: 2,
      unit_price: 25.99
    }
  ]
}
```

### Success Response

```javascript
{
  success: true,
  message: "Order created successfully",
  order_id: 1,
  order_number: "uuid-here",
  order: { /* complete order data */ }
}
```

## Form Validation

The component includes comprehensive validation:

- **Sender Number**: Required, phone number format
- **Transaction ID**: Required, minimum 3 characters
- **Payment Method**: Required selection

## Payment Methods

Supports three payment methods:

1. **bKash** - Mobile payment via bKash
2. **Nagad** - Mobile payment via Nagad  
3. **Credit/Debit Card** - Traditional card payment

## Styling

The component uses TailwindCSS with:
- Responsive design (mobile-first)
- Dark mode support
- Hover and focus states
- Smooth transitions
- Custom radio button styling

## Error Handling

- Real-time field validation
- API error display
- Network error handling
- User-friendly error messages

## Animation Features

- Modal slide-in/out animations
- Payment method selection feedback
- Loading spinner on submit
- Success checkmark animation
- Form field error animations

## Dependencies

- `framer-motion` - Animations
- `react-icons/fi` - Icons
- `tailwindcss` - Styling

## Demo

Visit `/payment-demo` to see the component in action with sample data.
