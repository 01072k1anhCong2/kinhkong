import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'react-toastify';
import './CheckoutPage.css';

function CheckoutPage({ cart, updateCartQuantity, clearCart, user }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    building: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showYuchoInfo, setShowYuchoInfo] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleInputChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentSelect = (method) => {
    setPaymentMethod(method);
    if (method === 'transfer') {
      setShowYuchoInfo(true);
    } else {
      setShowYuchoInfo(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!customerInfo.name || !customerInfo.phone || !customerInfo.postalCode || 
          !customerInfo.prefecture || !customerInfo.city || !customerInfo.address) {
        toast.error('すべての必須項目を入力してください');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!paymentMethod) {
        toast.error('支払い方法を選択してください');
        return;
      }
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.info('注文を確定するにはログインが必要です');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    try {
      const order = {
        userId: user.uid,
        userEmail: user.email,
        customerInfo,
        items: cart,
        total,
        paymentMethod: paymentMethod === 'cod' ? '着払い' : '銀行振込',
        status: 'pending',
        trackingNumber: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'orders'), order);
      toast.success('注文が完了しました！');
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('注文の処理に失敗しました');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart">
          <h2>カートが空です</h2>
          <p>商品を追加してください</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            商品を見る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">チェックアウト</h1>
        
        <div className="checkout-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">配送情報</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">支払い方法</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">確認</div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-main">
            {step === 1 && (
              <div className="step-content fade-in">
                <h2>配送先情報</h2>
                <div className="form-group">
                  <label className="form-label">お名前 *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    placeholder="山田 太郎"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">電話番号 *</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    placeholder="090-1234-5678"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">郵便番号 *</label>
                  <input
                    type="text"
                    name="postalCode"
                    className="form-input"
                    value={customerInfo.postalCode}
                    onChange={handleInputChange}
                    placeholder="123-4567"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">都道府県 *</label>
                  <input
                    type="text"
                    name="prefecture"
                    className="form-input"
                    value={customerInfo.prefecture}
                    onChange={handleInputChange}
                    placeholder="東京都"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">市区町村 *</label>
                  <input
                    type="text"
                    name="city"
                    className="form-input"
                    value={customerInfo.city}
                    onChange={handleInputChange}
                    placeholder="渋谷区"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">番地 *</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    placeholder="1-2-3"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">建物名・部屋番号</label>
                  <input
                    type="text"
                    name="building"
                    className="form-input"
                    value={customerInfo.building}
                    onChange={handleInputChange}
                    placeholder="○○マンション 101号室"
                  />
                </div>
                <button className="btn btn-primary btn-full" onClick={handleNextStep}>
                  次へ
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="step-content fade-in">
                <h2>支払い方法を選択</h2>
                <div className="payment-methods">
                  <div 
                    className={`payment-method ${paymentMethod === 'cod' ? 'selected' : ''}`}
                    onClick={() => handlePaymentSelect('cod')}
                  >
                    <div className="payment-icon">📦</div>
                    <div className="payment-info">
                      <h3>着払い</h3>
                      <p>商品到着時に配達員にお支払いください</p>
                    </div>
                  </div>
                  <div 
                    className={`payment-method ${paymentMethod === 'transfer' ? 'selected' : ''}`}
                    onClick={() => handlePaymentSelect('transfer')}
                  >
                    <div className="payment-icon">🏦</div>
                    <div className="payment-info">
                      <h3>銀行振込</h3>
                      <p>ゆうちょ銀行への振込</p>
                    </div>
                  </div>
                </div>

                {showYuchoInfo && (
                  <div className="yucho-info fade-in">
                    <h3>ゆうちょ銀行 振込先情報</h3>
                    <div className="bank-details">
                      <div className="bank-row">
                        <span className="bank-label">金融機関:</span>
                        <span className="bank-value">ゆうちょ銀行</span>
                      </div>
                      <div className="bank-row">
                        <span className="bank-label">記号:</span>
                        <span className="bank-value">12345</span>
                      </div>
                      <div className="bank-row">
                        <span className="bank-label">番号:</span>
                        <span className="bank-value">67890123</span>
                      </div>
                      <div className="bank-row">
                        <span className="bank-label">口座名義:</span>
                        <span className="bank-value">キングコング（カ</span>
                      </div>
                      <div className="bank-row">
                        <span className="bank-label">振込金額:</span>
                        <span className="bank-value">¥{total.toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="bank-note">※振込手数料はお客様負担となります</p>
                  </div>
                )}

                <div className="step-buttons">
                  <button className="btn btn-outline" onClick={() => setStep(1)}>
                    戻る
                  </button>
                  <button className="btn btn-primary" onClick={handleNextStep}>
                    次へ
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="step-content fade-in">
                <h2>注文内容の確認</h2>
                <div className="confirmation-section">
                  <h3>配送先</h3>
                  <p>〒{customerInfo.postalCode}</p>
                  <p>{customerInfo.prefecture} {customerInfo.city} {customerInfo.address}</p>
                  {customerInfo.building && <p>{customerInfo.building}</p>}
                  <p>{customerInfo.name} 様</p>
                  <p>TEL: {customerInfo.phone}</p>
                </div>
                <div className="confirmation-section">
                  <h3>支払い方法</h3>
                  <p>{paymentMethod === 'cod' ? '着払い' : '銀行振込'}</p>
                </div>
                <div className="step-buttons">
                  <button className="btn btn-outline" onClick={() => setStep(2)}>
                    戻る
                  </button>
                  <button className="btn btn-secondary btn-full" onClick={handlePlaceOrder}>
                    {user ? '注文を確定する' : 'ログインして注文する'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="checkout-sidebar">
            <div className="cart-summary card">
              <h3>注文内容</h3>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <div className="quantity-control">
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="qty-btn"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="qty-btn"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-price">
                      ¥{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <span>合計</span>
                <span className="total-price">¥{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
