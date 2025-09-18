/**
 * Example component demonstrating API integration
 * This is a standalone component that can be imported into any existing component
 * without modifying existing files
 */

import React, { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { productApi, memberApi, orderApi, apiUtils, Product, Member, Order } from '../services/api';

// Example: Product List Component
export const ApiProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    const response = await productApi.getAllProducts();
    
    if (response.success && response.data) {
      setProducts(response.data);
    } else {
      setError(response.error || 'Failed to fetch products');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Products from Backend API
      </Typography>
      <Button 
        variant="contained" 
        onClick={fetchProducts}
        sx={{ mb: 2 }}
      >
        Refresh Products
      </Button>
      
      {products.map((product) => (
        <Card key={product._id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{product.productName}</Typography>
            <Typography variant="body2" color="text.secondary">
              Price: ${product.productPrice}
            </Typography>
            {product.productDescription && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {product.productDescription}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

// Example: API Health Check Component
export const ApiHealthCheck: React.FC = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    const healthy = await apiUtils.checkHealth();
    setIsHealthy(healthy);
    setChecking(false);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Backend API Status
      </Typography>
      <Button 
        variant="outlined" 
        onClick={checkHealth}
        disabled={checking}
        sx={{ mb: 2 }}
      >
        {checking ? 'Checking...' : 'Check API Health'}
      </Button>
      
      {isHealthy === true && (
        <Alert severity="success">
          Backend API is running and accessible
        </Alert>
      )}
      
      {isHealthy === false && (
        <Alert severity="error">
          Backend API is not accessible. Make sure it's running on port 3003
        </Alert>
      )}
    </Box>
  );
};

// Example: Login Form Component
export const ApiLoginForm: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const response = await memberApi.login({
      memberPhone: phone,
      memberPassword: password,
    });

    if (response.success && response.data) {
      setMessage(`Welcome, ${response.data.memberNick}!`);
    } else {
      setMessage(response.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Login via Backend API
      </Typography>
      
      <form onSubmit={handleLogin}>
        <Box mb={2}>
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
        </Box>
        <Box mb={2}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
        </Box>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          fullWidth
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      
      {message && (
        <Alert severity={message.includes('Welcome') ? 'success' : 'error'} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
    </Box>
  );
};

// Example: Custom Hook for API Data
export const useApiData = <T,>(apiCall: () => Promise<{ success: boolean; data?: T; error?: string }>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    const response = await apiCall();
    
    if (response.success && response.data) {
      setData(response.data);
    } else {
      setError(response.error || 'Failed to fetch data');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

// Example usage of the custom hook
export const ProductsWithHook: React.FC = () => {
  const { data: products, loading, error, refetch } = useApiData<Product[]>(productApi.getAllProducts);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box p={2}>
      <Typography variant="h6">Products (using custom hook)</Typography>
      <Button onClick={refetch} sx={{ mb: 2 }}>Refresh</Button>
      {products?.map((product) => (
        <Typography key={product._id}>{product.productName}</Typography>
      ))}
    </Box>
  );
};

export default {
  ApiProductList,
  ApiHealthCheck,
  ApiLoginForm,
  ProductsWithHook,
  useApiData,
};
