import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, BarChart3, CheckCircle2, Eye, EyeOff, Lock, User } from 'lucide-react';
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
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Đăng nhập thất bại.';
      setError(typeof msg === 'string' ? msg : 'Sai tên đăng nhập hoặc mật khẩu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 font-sans">
      <video
        src="/video/useplink.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.82),rgba(30,64,175,0.4),rgba(15,23,42,0.72))]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(147,197,253,0.25),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.24),transparent_34%)]"></div>

      <div className="relative z-10 flex min-h-screen flex-col px-6 py-8 sm:px-8 lg:px-10 xl:px-14">
        <div className="flex items-center justify-end">
          <Link
            to="/"
            className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white/90 backdrop-blur-md transition-colors hover:bg-white/15 lg:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay về Home
          </Link>
        </div>

        <div className="flex flex-1 items-center py-8 lg:py-0">
          <div className="mx-auto grid w-full max-w-[1320px] items-center gap-8 lg:grid-cols-10 xl:gap-10">
            <section className="hidden -translate-y-6 text-white lg:col-span-6 lg:block xl:-translate-y-8">
              <h1 className="max-w-[620px] text-[3.35rem] font-extrabold leading-[1.02] xl:text-[4.6rem]">
                Làm việc thông minh hơn cùng HR Payroll.
              </h1>
              <p className="mt-6 max-w-[560px] text-[1.15rem] leading-relaxed text-blue-50/92 xl:text-[1.22rem]">
                Nền tảng quản lý nhân sự, chấm công và tiền lương chuyên nghiệp.
              </p>
              <div className="mt-10 grid max-w-[560px] grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-md shadow-[0_18px_40px_rgba(15,23,42,0.14)]"
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10">
                      <CheckCircle2 className="h-5 w-5 text-blue-100" />
                    </div>
                    <div className="text-[2rem] font-bold leading-none text-white">{stat.value}</div>
                    <div className="mt-2 text-sm text-blue-100/95">{stat.label}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex items-center justify-center lg:col-span-4 lg:justify-end">
              <div className="w-full max-w-[560px]">
                <div className="rounded-[36px] border border-white/20 bg-white/18 p-6 shadow-[0_35px_100px_rgba(15,23,42,0.28)] backdrop-blur-2xl sm:p-8 lg:p-10">
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/95 shadow-lg shadow-blue-900/25">
                      <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mb-2 text-4xl font-extrabold text-slate-950">Xin chào!</h2>
                    <p className="text-lg text-slate-700">
                      Đăng nhập để tiếp tục vào hệ thống quản lý.
                    </p>
                  </div>

                  {error ? (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200/70 bg-red-50/90 px-4 py-3 text-sm text-red-700">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      {error}
                    </div>
                  ) : null}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="login-username" className="mb-2 block text-sm font-semibold text-slate-800">
                        Tên đăng nhập
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                        <input
                          id="login-username"
                          name="username"
                          type="text"
                          autoComplete="username"
                          value={form.username}
                          onChange={handleChange}
                          placeholder="Nhập tên đăng nhập"
                          className="w-full rounded-2xl border border-white/35 bg-white/72 py-4 pl-12 pr-4 text-sm text-slate-900 outline-none backdrop-blur-sm transition-all focus:border-blue-400 focus:bg-white/86 focus:ring-4 focus:ring-blue-500/15"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-slate-800">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                        <input
                          id="login-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Nhập mật khẩu"
                          className="w-full rounded-2xl border border-white/35 bg-white/72 py-4 pl-12 pr-12 text-sm text-slate-900 outline-none backdrop-blur-sm transition-all focus:border-blue-400 focus:bg-white/86 focus:ring-4 focus:ring-blue-500/15"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-700"
                          tabIndex={-1}
                          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 transition-colors hover:text-slate-900">
                        <input
                          type="checkbox"
                          name="remember"
                          checked={form.remember}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                        />
                        Ghi nhớ đăng nhập
                      </label>
                      <Link to="/forgot-password" className="text-sm text-blue-600 transition-colors hover:text-blue-700">
                        Quên mật khẩu?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-2 w-full rounded-2xl bg-blue-500 py-4 text-base font-bold text-white shadow-[0_16px_32px_rgba(37,99,235,0.34)] transition-all hover:bg-blue-600 hover:shadow-[0_22px_38px_rgba(37,99,235,0.38)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                    >
                      {loading ? 'Đang xác thực...' : 'Đăng nhập'}
                    </button>
                  </form>

                  <div className="mt-6 space-y-4 text-center">
                    <p className="text-base text-slate-700">
                      Chưa có tài khoản?{' '}
                      <Link to="/register" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
                        Đăng ký
                      </Link>
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600">
                      <Link to="/" className="font-medium transition-colors hover:text-blue-700 lg:hidden">
                        Quay về Home
                      </Link>
                      <span className="hidden h-1 w-1 rounded-full bg-slate-400 lg:block"></span>
                      <span>Bảo mật tiêu chuẩn doanh nghiệp</span>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-center text-xs text-white/75">
                  &copy; {new Date().getFullYear()} CMU-CS-445 · Nền tảng quản trị nhân sự
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
