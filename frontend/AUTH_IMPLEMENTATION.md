# Authentication Implementation

This document describes the authentication functions implemented for the Next.js frontend of the iCommerce application.

## Files Created/Modified

### 1. `app/lib/api.js` (Modified)
Added authentication functions:
- `loginUser(email, password)` - Authenticates user and stores JWT tokens
- `signupUser(userData)` - Registers new user and stores JWT tokens
- Updated `fetchAPI` to automatically include auth headers

### 2. `app/lib/auth.js` (New)
Authentication utilities:
- Token management functions
- Authentication status checking
- Token refresh functionality
- Logout functionality

### 3. `app/hooks/useAuth.js` (New)
Custom React hook for authentication state management

### 4. `app/Components/AuthExample.js` (New)
Example component showing how to use the authentication functions

## Usage

### Basic Login/Signup

```javascript
import { loginUser, signupUser } from '../lib/api';

// Login
const loginResult = await loginUser('user@example.com', 'password123');
if (!loginResult.error) {
  // Tokens are automatically stored in localStorage
  console.log('Login successful');
}

// Signup
const signupData = {
  email: 'user@example.com',
  password: 'password123',
  first_name: 'John',
  last_name: 'Doe'
};
const signupResult = await signupUser(signupData);
if (!signupResult.error) {
  // Tokens are automatically stored in localStorage
  console.log('Signup successful');
}
```

### Using the Authentication Hook

```javascript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { isLoggedIn, loading, login, signup, logout } = useAuth();

  const handleLogin = async () => {
    const result = await login('user@example.com', 'password123');
    if (result.success) {
      console.log('Login successful');
    } else {
      console.error('Login failed:', result.error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isLoggedIn ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Using Authentication Utilities

```javascript
import { 
  isAuthenticated, 
  getAccessToken, 
  clearTokens,
  refreshAccessToken 
} from '../lib/auth';

// Check if user is authenticated
const authenticated = isAuthenticated();

// Get current access token
const token = getAccessToken();

// Manually clear tokens (logout)
clearTokens();

// Refresh access token
try {
  const newToken = await refreshAccessToken();
  console.log('Token refreshed');
} catch (error) {
  console.error('Token refresh failed');
}
```

## API Endpoints

The authentication functions expect these backend endpoints:

### Login: `POST /api/token/`
Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Signup: `POST /api/register/`
Request body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Token Refresh: `POST /api/token/refresh/`
Request body:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## Token Storage

JWT tokens are stored in localStorage:
- `accessToken` - Short-lived token for API requests
- `refreshToken` - Long-lived token for refreshing access tokens

## Automatic Authentication

The `fetchAPI` function in `api.js` automatically includes the Authorization header with the access token for all API requests. This means you don't need to manually add auth headers to your API calls.

## Error Handling

All authentication functions include comprehensive error handling and return structured responses:

```javascript
{
  success: boolean,
  data?: any,
  error?: string,
  message: string
}
```

## Security Considerations

1. Tokens are stored in localStorage (consider httpOnly cookies for production)
2. Access token expiry is checked before making requests
3. Automatic token refresh when access token expires
4. Tokens are cleared on logout
5. Server-side authentication should validate JWT tokens

## Next Steps

1. Implement protected routes using the authentication state
2. Add automatic token refresh on API 401 responses
3. Consider implementing httpOnly cookies for enhanced security
4. Add user profile management functions
5. Implement remember me functionality
