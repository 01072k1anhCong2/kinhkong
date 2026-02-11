import React from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  return (
    <div className="admin-page">
      <div className="container">
        <h1 className="page-title">管理画面</h1>
        
        <div className="admin-grid">
          <Link to="/admin/products" className="admin-card fade-in">
            <div className="admin-icon">📦</div>
            <h2>商品管理</h2>
            <p>商品の追加、編集、削除</p>
          </Link>

          <Link to="/admin/orders" className="admin-card fade-in">
            <div className="admin-icon">📋</div>
            <h2>注文管理</h2>
            <p>注文の確認と配送管理</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
