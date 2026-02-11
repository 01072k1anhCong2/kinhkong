import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import './OrdersPage.css';

function OrdersPage({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('注文履歴の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '処理中',
      'processing': '発送準備中',
      'shipped': '発送済み',
      'delivered': '配達完了',
      'cancelled': 'キャンセル'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return classMap[status] || '';
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="page-title">注文履歴</h1>

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>まだ注文がありません</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card fade-in">
                <div className="order-header">
                  <div className="order-info">
                    <h3 className="order-id">注文番号: {order.id.substring(0, 8)}</h3>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="order-body">
                  <div className="order-items">
                    <h4>注文内容</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x {item.quantity}</span>
                        <span className="item-price">¥{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-details">
                    <div className="detail-section">
                      <h4>配送先</h4>
                      <p>〒{order.customerInfo.postalCode}</p>
                      <p>{order.customerInfo.prefecture} {order.customerInfo.city} {order.customerInfo.address}</p>
                      {order.customerInfo.building && <p>{order.customerInfo.building}</p>}
                      <p>{order.customerInfo.name} 様</p>
                      <p>TEL: {order.customerInfo.phone}</p>
                    </div>

                    <div className="detail-section">
                      <h4>支払い方法</h4>
                      <p>{order.paymentMethod}</p>
                    </div>

                    {order.trackingNumber && (
                      <div className="detail-section tracking-section">
                        <h4>配送追跡番号</h4>
                        <div className="tracking-number">
                          <span className="tracking-icon">📦</span>
                          <span className="tracking-code">{order.trackingNumber}</span>
                        </div>
                        <p className="tracking-note">
                          ヤマト運輸または郵便局のウェブサイトで追跡できます
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-footer">
                  <span className="order-total">合計: ¥{order.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
