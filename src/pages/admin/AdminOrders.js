import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('注文の読み込みに失敗しました');
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

  const openModal = (order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || '');
    setOrderStatus(order.status || 'pending');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setTrackingNumber('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        trackingNumber,
        status: orderStatus,
        updatedAt: new Date().toISOString()
      });

      toast.success('注文情報を更新しました');
      closeModal();
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('注文情報の更新に失敗しました');
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-section">
          <div className="section-header">
            <h2 className="section-title">注文管理</h2>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <p>まだ注文がありません</p>
            </div>
          ) : (
            <div className="orders-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>注文ID</th>
                    <th>顧客名</th>
                    <th>注文日</th>
                    <th>金額</th>
                    <th>支払い方法</th>
                    <th>ステータス</th>
                    <th>追跡番号</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id.substring(0, 8)}</td>
                      <td>{order.customerInfo?.name}</td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td>¥{order.total?.toLocaleString()}</td>
                      <td>{order.paymentMethod}</td>
                      <td>{getStatusText(order.status)}</td>
                      <td>
                        {order.trackingNumber ? (
                          <span className="tracking-display">{order.trackingNumber}</span>
                        ) : (
                          <span className="no-tracking">未設定</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn btn-small btn-edit"
                          onClick={() => openModal(order)}
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">注文情報編集</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="order-details-modal">
              <div className="detail-row">
                <strong>注文ID:</strong>
                <span>{selectedOrder.id}</span>
              </div>
              <div className="detail-row">
                <strong>顧客名:</strong>
                <span>{selectedOrder.customerInfo?.name}</span>
              </div>
              <div className="detail-row">
                <strong>電話番号:</strong>
                <span>{selectedOrder.customerInfo?.phone}</span>
              </div>
              <div className="detail-row">
                <strong>配送先:</strong>
                <span>
                  〒{selectedOrder.customerInfo?.postalCode}<br/>
                  {selectedOrder.customerInfo?.prefecture} {selectedOrder.customerInfo?.city} {selectedOrder.customerInfo?.address}<br/>
                  {selectedOrder.customerInfo?.building}
                </span>
              </div>
              <div className="detail-row">
                <strong>注文内容:</strong>
                <div>
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index}>
                      {item.name} x {item.quantity} - ¥{(item.price * item.quantity).toLocaleString()}
                    </div>
                  ))}
                </div>
              </div>
              <div className="detail-row">
                <strong>合計金額:</strong>
                <span>¥{selectedOrder.total?.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleUpdate} style={{ marginTop: '2rem' }}>
              <div className="form-group">
                <label className="form-label">注文ステータス</label>
                <select
                  className="form-select"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                >
                  <option value="pending">処理中</option>
                  <option value="processing">発送準備中</option>
                  <option value="shipped">発送済み</option>
                  <option value="delivered">配達完了</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  配送追跡番号 (ヤマト運輸 / 郵便局)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="例: 123456789012"
                />
                <small style={{ color: 'var(--text-light)', marginTop: '0.5rem', display: 'block' }}>
                  ヤマト運輸の場合は12桁、郵便局の場合は11〜13桁の番号を入力してください
                </small>
              </div>

              <div className="action-buttons">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
