// Timezone Test Script
// Run this with: node timezone_test.js

console.log('=== TIMEZONE DEBUG TEST ===');

// Your expiry time from database
const expiryFromDB = '2026-04-23T03:43:07.000Z';
console.log('Expiry from DB:', expiryFromDB);

// Current time
const now = new Date();
console.log('Current time:', now.toISOString());

// Parse the expiry time
const expiryTime = new Date(expiryFromDB);
console.log('Parsed expiry:', expiryTime.toISOString());

// Compare timestamps
console.log('Current timestamp:', now.getTime());
console.log('Expiry timestamp:', expiryTime.getTime());

// Calculate difference
const diffMs = expiryTime.getTime() - now.getTime();
const diffMinutes = diffMs / (1000 * 60);
const diffSeconds = diffMs / 1000;

console.log('Difference (ms):', diffMs);
console.log('Difference (seconds):', diffSeconds.toFixed(2));
console.log('Difference (minutes):', diffMinutes.toFixed(2));

// Check if expired
const isExpired = now.getTime() > expiryTime.getTime();
console.log('Is expired?:', isExpired);

if (isExpired) {
  console.log('❌ EXPIRED by', Math.abs(diffMinutes).toFixed(2), 'minutes');
} else {
  console.log('✅ VALID for', diffMinutes.toFixed(2), 'more minutes');
}

console.log('=== END TEST ===');