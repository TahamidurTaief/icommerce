# Shipping Methods Component

A React component for displaying shipping methods with interactive modals.

## Features

- 🚚 Fetches shipping methods from API
- 💳 Displays each method as a card with title and price
- ℹ️ Info icon next to each method
- 🎭 Modal with full description on info click
- 🎨 TailwindCSS styling
- ✨ Framer Motion animations
- 🌓 Dark mode support

## Usage

### Basic Usage

```jsx
import { ShippingMethods } from "@/app/Components/Shipping";

export default function CheckoutPage() {
  return (
    <div>
      <ShippingMethods />
    </div>
  );
}
```

### With Custom Styling

```jsx
import { ShippingMethods } from "@/app/Components/Shipping";

export default function CheckoutPage() {
  return (
    <div>
      <ShippingMethods className="max-w-4xl mx-auto mt-8" />
    </div>
  );
}
```

## API Response Format

The component expects the API to return an array of shipping methods:

```json
[
  {
    "id": 1,
    "title": "Standard Delivery",
    "name": "Standard Delivery", 
    "description": "Delivery within 3-5 business days",
    "price": "5.99"
  },
  {
    "id": 2,
    "title": "Express Delivery",
    "name": "Express Delivery",
    "description": "Delivery within 1-2 business days", 
    "price": "12.99"
  }
]
```

## Component Structure

- `ShippingMethods` - Main container component
- `ShippingMethodCard` - Individual shipping method card
- `ShippingMethodModal` - Modal for displaying detailed information

## Animation Features

- Staggered card animations on load
- Hover effects on cards and buttons
- Smooth modal open/close transitions
- Loading skeleton animations

## Dependencies

- framer-motion
- react-icons/fi
- tailwindcss

## Demo

Visit `/shipping` to see the component in action.
