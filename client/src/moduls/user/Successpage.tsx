import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag } from 'lucide-react';

const SuccessPage = () => {
  const navigate = useNavigate();

  const deliveryDate = new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
      <div className="flex flex-col items-center text-center gap-6 max-w-sm w-full">

        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle size={48} className="text-emerald-400" strokeWidth={1.5} />
        </div>

        {/* Text */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Order Placed!</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Thank you for shopping with <span className="text-violet-400 font-semibold">Haxord</span>.
            Your order will arrive within <span className="text-white font-semibold">5 days</span> by{' '}
            <span className="text-white font-semibold">{deliveryDate}</span>.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-zinc-800" />

        {/* Buttons */}
        <div className="flex flex-col w-full gap-3">
          <button
            onClick={() => navigate('/productlist')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors"
          >
            <ShoppingBag size={17} />
            Continue Shopping
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="w-full py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors text-sm"
          >
            View My Orders
          </button>
        </div>

      </div>
    </div>
  );
};

export default SuccessPage;