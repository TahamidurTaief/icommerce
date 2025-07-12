// app/lib/Data/CouponData.jsx
// This file contains sample coupon data for testing purposes.

export const CouponData = [
  {
    code: "SAVE10",
    discount: 10, // 10% off
    minPurchase: 50, // Minimum purchase amount for this coupon
    expires: "2025-12-31", // Expiration date
    description: "Get 10% off on orders over $50",
  },
  {
    code: "FREESHIP",
    discount: 100, // 100% off shipping (effectively free shipping)
    type: "shipping", // Indicates this coupon is for shipping
    minPurchase: 100,
    expires: "2025-11-15",
    description: "Free shipping on orders over $100",
  },
  {
    code: "NEWUSER20",
    discount: 20, // 20% off
    minPurchase: 75,
    expires: "2025-10-01",
    description: "20% off for new users on orders over $75",
  },
  {
    code: "SUMMER25",
    discount: 25, // 25% off
    minPurchase: 150,
    expires: "2025-09-30",
    description: "Summer sale: 25% off on orders over $150",
  },
];
