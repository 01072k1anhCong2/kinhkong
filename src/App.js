import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

// Components
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
        <Routes>
          <Route path="/" element={<HomePage addToCart={addToCart} />} />
          <Route 
            path="/checkout" 
            element={
              <CheckoutPage 
                cart={cart} 
                updateCartQuantity={updateCartQuantity}
                clearCart={clearCart}
                user={user}
              />
            } 
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/orders" 
            element={user ? <OrdersPage user={user} /> : <Navigate to="/login" />} 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={user?.email === 'admin@kingkong.com' ? <AdminDashboard /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin/products" 
            element={user?.email === 'admin@kingkong.com' ? <AdminProducts /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin/orders" 
            element={user?.email === 'admin@kingkong.com' ? <AdminOrders /> : <Navigate to="/" />} 
          />
        </Routes>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />

      </div>
    </Router>
  );
}

export default App;
