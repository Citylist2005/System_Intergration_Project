import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, BarChart3, Eye, EyeOff, Lock, User } from 'lucide-react';
import { login } from '../api/services/authService';

const stats = [
  { label: 'Nhân viên', value: '200+' },
  { label: 'Phòng ban', value: '10+' },
  { label: 'Bản ghi lương', value: '2K+' },
  { label: 'Thời gian hoạt động', value: '99.9%' },
];

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await login(form.username, form.password);
      const token =
        data?.data?.accessToken ??
        data?.data?.access_token ??
        data?.data?.token ??
        data?.accessToken ??
        data?.access_token ??
        data?.token;
      const user = data?.data?.user ?? data?.user ?? { username: form.username };

      if (!token) {
        throw new Error('Máy chủ không trả về token đăng nhập hợp lệ.');
      }

      localStorage.setItem('hr_token', token);
      localStorage.setItem('hr_user', JSON.stringify(user));
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Đăng nhập thất bại.';
      setError(typeof msg === 'string' ? msg : 'Sai tên đăng nhập hoặc mật khẩu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen px-5 py-6 sm:px-8 lg:px-10"
      style={{
        background:
          'linear-gradient(135deg, var(--sidebar-bg-deep) 0%, var(--sidebar-bg) 58%, #2a3070 100%)',
      }}
    >
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] xl:gap-16">
        <section className="hidden lg:flex flex-col justify-center">
          <div className="max-w-xl">
            <div className="mb-14 flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg shadow-blue-950/20"
                style={{ background: 'var(--color-primary)' }}
              >
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-[0.24em]"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Hệ thống
                </p>
                <p className="text-2xl font-bold text-white">Dự án tích hợp</p>
              </div>
            </div>

            <h1 className="max-w-lg text-5xl font-extrabold leading-tight text-white">
              Hệ thống quản lý nhân sự và tiền lương
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8" style={{ color: 'rgba(255,255,255,0.72)' }}>
              Quản lý nhân sự, chấm công và bảng lương tập trung. Đồng bộ dữ liệu thời gian thực giữa hệ thống legacy SQL Server và MySQL.
            </p>

            <div className="mt-12 grid max-w-xl grid-cols-2 gap-5">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-5"
                  style={{
                    background: 'rgba(255,255,255,0.075)',
                    border: '1px solid rgba(255,255,255,0.14)',
                  }}
                >
                  <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                  <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.62)' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center lg:justify-end">
          <div
            className="w-full max-w-[460px] rounded-[28px] px-7 py-8 shadow-2xl sm:px-9 sm:py-10"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'var(--color-primary)' }}
              >
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>
                  Hệ thống
                </p>
                <p className="font-bold" style={{ color: 'var(--color-text)' }}>
                  Dự án tích hợp
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-extrabold" style={{ color: 'var(--color-text)' }}>
                Đăng nhập
              </h2>
              <p className="mt-2 text-sm leading-6" style={{ color: 'var(--color-muted)' }}>
                Nhập thông tin tài khoản của bạn để tiếp tục.
              </p>
            </div>

            {error ? (
              <div
                className="mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
                style={{
                  background: 'var(--badge-critical-bg)',
                  color: 'var(--badge-critical-text)',
                  border: '1px solid #fca5a5',
                }}
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="login-username"
                  className="mb-2 block text-sm font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: 'var(--color-muted)' }}
                  />
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Nhập tên đăng nhập"
                    className="w-full rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-blue-200"
                    style={{
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-2 block text-sm font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: 'var(--color-muted)' }}
                  />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu"
                    className="w-full rounded-2xl py-3.5 pl-11 pr-11 text-sm outline-none transition focus:ring-2 focus:ring-blue-200"
                    style={{
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--color-muted)' }}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex w-fit cursor-pointer items-center gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="rounded"
                />
                Ghi nhớ đăng nhập
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl py-3.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: loading
                    ? 'var(--color-muted)'
                    : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                }}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <p className="mt-8 text-center text-xs" style={{ color: 'var(--color-muted)' }}>
              CMU-CS-445 · Hệ thống tích hợp nhân sự và tiền lương
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
