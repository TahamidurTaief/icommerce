# Sound Effects for iCommerce Checkout

This directory contains royalty-free sound effects for the checkout page notifications.

## Files:
- `success.mp3` - Pleasant chime for successful actions (coupon applied, payment confirmed)
- `error.mp3` - Soft error tone for failed actions (invalid coupon, payment error)
- `warning.mp3` - Neutral notification tone for warnings (form validation, alerts)

## Usage:
These sounds are lightweight (<200KB each) and optimized for web use. They can be played using the HTML5 Audio API:

```javascript
const playSound = (soundName) => {
  const audio = new Audio(`/sounds/${soundName}.mp3`);
  audio.volume = 0.5; // Adjust volume as needed
  audio.play().catch(e => console.log('Sound play failed:', e));
};
```

## License:
All sound effects are royalty-free and can be used commercially without attribution required.
