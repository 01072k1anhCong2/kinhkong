import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    features: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('商品の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        imageUrl: product.imageUrl || '',
        features: product.features ? product.features.join(', ') : ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        features: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      imageUrl: formData.imageUrl,
      features: formData.features.split(',').map(f => f.trim()).filter(f => f)
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('商品を更新しました');
      } else {
        await addDoc(collection(db, 'products'), productData);
        toast.success('商品を追加しました');
      }
      
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('商品の保存に失敗しました');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('本当にこの商品を削除しますか？')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        toast.success('商品を削除しました');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('商品の削除に失敗しました');
      }
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
            <h2 className="section-title">商品管理</h2>
            <button className="btn btn-primary" onClick={() => openModal()}>
              新規商品追加
            </button>
          </div>

          {products.length === 0 ? (
            <div className="empty-state">
              <p>まだ商品がありません</p>
              <button className="btn btn-primary" onClick={() => openModal()}>
                最初の商品を追加
              </button>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>商品名</th>
                  <th>価格</th>
                  <th>説明</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>¥{product.price?.toLocaleString()}</td>
                    <td>{product.description}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-small btn-edit"
                          onClick={() => openModal(product)}
                        >
                          編集
                        </button>
                        <button 
                          className="btn btn-small btn-delete"
                          onClick={() => handleDelete(product.id)}
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProduct ? '商品編集' : '新規商品追加'}
              </h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">商品名 *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">価格 *</label>
                <input
                  type="number"
                  name="price"
                  className="form-input"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">説明</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">画像URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  className="form-input"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label className="form-label">特徴（カンマ区切り）</label>
                <input
                  type="text"
                  name="features"
                  className="form-input"
                  value={formData.features}
                  onChange={handleInputChange}
                  placeholder="例: 9H硬度, 指紋防止, 気泡ゼロ"
                />
              </div>

              <div className="action-buttons">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? '更新' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
