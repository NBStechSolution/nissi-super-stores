export const ADMIN_PHONE = '9966712681';
export const ADMIN_NAME = 'abhi naidu';
export const ADMIN_SECURITY_PIN = '9966';

export const PAYMENT_CONFIG = {
  upiId: 'abicharan07@axl',
  payeeName: 'Nissi Super Stores',
  merchantName: 'Abhi Charan (Nissi Super Stores)',
  qrCodeUrl: '/payment-qr.jpeg',
  bankProvider: 'Axis Bank / AXL',
  acceptedApps: ['PhonePe', 'Google Pay', 'Paytm', 'BHIM', 'Amazon Pay', 'Cred UPI'],
  generateUpiUri: (amount, orderId = 'NISSI') => {
    const cleanAmount = Number(amount || 0).toFixed(2);
    return `upi://pay?pa=abicharan07@axl&pn=Nissi%20Super%20Stores&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId} Nissi Super Stores`)}`;
  }
};
