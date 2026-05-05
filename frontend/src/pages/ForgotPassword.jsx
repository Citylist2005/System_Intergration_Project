import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Mail, BarChart3, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập địa chỉ email.');
      return;
    }

    setLoading(true);
    setError('');
    
    // Simulate API call since no endpoint exists yet
    setTimeout(() => {
      setLoading(false);
      setSuccess('Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi.');
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row">
      {/* Left Section - Intro/Branding */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-blue-500 text-white flex-col justify-center px-12 lg:px-24">
        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/3 -translate-y-1/3 animate-pulse" style={{ animationDuration: '10s' }}></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="relative z-10">
           <Link to="/" className="mb-14 flex items-center gap-3 w-fit">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xl shadow-blue-900/20">
              <BarChart3 className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-100">
                Hệ thống
              </p>
              <p className="text-xl font-bold text-white">HR Payroll</p>
            </div>
          </Link>

          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            Bảo mật hàng đầu.
          </h1>
          <p className="text-lg text-blue-100 max-w-xl mb-12 leading-relaxed">
            Hệ thống quản lý nhân sự an toàn, bảo vệ dữ liệu của bạn mọi lúc mọi nơi.
          </p>
        </div>
      </section>

      {/* Right Section - Form */}
      <section className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-24 bg-white relative">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Header */}
          <div className="mb-10 flex items-center gap-3 md:hidden">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
               <BarChart3 className="h-5 w-5 text-white" />
             </div>
             <div>
               <p className="text-xs font-bold uppercase tracking-widest text-blue-500">Hệ thống</p>
               <p className="font-bold text-slate-900">HR Payroll</p>
             </div>
          </div>

          <div className="mb-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Quên mật khẩu</h2>
            <p className="text-slate-500">Nhập email để nhận hướng dẫn đặt lại mật khẩu.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-100">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email"
                  className="w-full rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none mt-2"
            >
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            <Link to="/login" className="text-blue-500 hover:text-blue-600 transition-colors font-medium">
              Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
