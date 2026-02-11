import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import './HomePage.css';

function HomePage({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name}をカートに追加しました`);
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1 className="hero-title">最高品質の強化ガラス</h1>
        <p className="hero-subtitle">あなたのスマホを守る、日本製プレミアム保護フィルム</p>
      </div>

      <div className="container">
        <div className="products-grid">
          {products.length === 0 ? (
            <div className="no-products">
              <p>現在、商品はありません</p>
            </div>
          ) : (
            products.map(product => (
              <div key={product.id} className="product-card fade-in">
                {product.imageUrl && (
                  <div className="product-image">
                    <img src={product.imageUrl} alt={product.name} />
                  </div>
                )}
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-features">
                    {product.features && product.features.map((feature, index) => (
                      <span key={index} className="feature-tag">✓ {feature}</span>
                    ))}
                  </div>
                  <div className="product-footer">
                    <span className="product-price">¥{product.price?.toLocaleString()}</span>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleAddToCart(product)}
                    >
                      カートに追加
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">なぜKING KONGを選ぶのか</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🛡️</div>
              <h3>最高の保護</h3>
              <p>9H硬度の強化ガラスで画面をしっかり保護</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✨</div>
              <h3>クリアな視界</h3>
              <p>高透過率で画面本来の美しさを損なわない</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🚚</div>
              <h3>安心配送</h3>
              <p>日本全国どこでも迅速にお届け</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
