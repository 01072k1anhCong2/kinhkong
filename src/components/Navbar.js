import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-toastify';

function Navbar({ user, cartCount }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('ログアウトしました');
      navigate('/');
    } catch (error) {
      toast.error('ログアウトに失敗しました');
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo">
          KING KONG GLASS
        </Link>

        {/* nút hamburger */}
        <button className={`menu-toggle ${isOpen ? "open" : ""}`}
        onClick={() => toggleMenu()}>
          ☰
        </button>

        <div className={`navbar-menu ${isOpen ? 'open' : ''}`}>
          <Link to="/" className="navbar-link" onClick={() => setIsOpen(false)}>ホーム</Link>

          {user && (
            <>
              <Link to="/orders" className="navbar-link" onClick={() => setIsOpen(false)}>注文履歴</Link>
              {user.email === 'admin@kingkong.com' && (
                <Link to="/admin" className="navbar-link" onClick={() => setIsOpen(false)}>管理画面</Link>
              )}
            </>
          )}

          {!user ? (
            <>
              <Link to="/login" className="navbar-link" onClick={() => setIsOpen(false)}>ログイン</Link>
              <Link to="/register" className="navbar-link" onClick={() => setIsOpen(false)}>新規登録</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="logout-btn">
              ログアウト
            </button>
          )}

          <Link to="/checkout" className="navbar-link cart-icon" onClick={() => setIsOpen(false)}>
            🛒
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
