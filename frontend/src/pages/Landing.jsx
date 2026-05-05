import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, PlayCircle } from 'lucide-react';

const featureCards = [
  {
    title: 'Quản lý nhân sự',
    description: 'Theo dõi hồ sơ, vòng đời và các cột mốc nhân sự trong một không gian thống nhất.',
  },
  {
    title: 'Chấm công',
    description: 'Quản lý ca làm việc, nghỉ phép và tăng ca với dữ liệu cập nhật rõ ràng.',
  },
  {
    title: 'Tính lương',
    description: 'Tự động hóa bảng lương, chính sách lương và các điều chỉnh quan trọng.',
  },
  {
    title: 'Báo cáo',
    description: 'Tổng hợp nhanh các chỉ số nhân sự, chấm công và lương để ra quyết định.',
  },
  {
    title: 'Đồng bộ dữ liệu',
    description: 'Theo dõi sức khỏe hệ thống và đồng bộ dữ liệu vận hành an toàn hơn.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#F8FAFC] font-sans text-[#0F172A]">
      <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/20">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-widest text-blue-500">
                  Hệ thống
                </span>
                <span className="block text-sm font-bold leading-tight text-slate-800">
                  HR Payroll
                </span>
              </div>
            </Link>

            <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
              <a href="#platform" className="transition-colors hover:text-blue-500">
                Nền tảng
              </a>
              <a href="#features" className="transition-colors hover:text-blue-500">
                Tính năng
              </a>
              <a href="#reports" className="transition-colors hover:text-blue-500">
                Báo cáo
              </a>
              <a href="#about" className="transition-colors hover:text-blue-500">
                Giới thiệu
              </a>
            </div>
          </div>

          <Link
            to="/login"
            className="rounded-full bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-md"
          >
            Đăng nhập
          </Link>
        </div>
      </nav>

      <main className="relative px-6 pb-20 pt-32 md:px-12 lg:pb-24 lg:pt-44">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -right-[10%] -top-[25%] h-[70%] w-[55%] rounded-full bg-blue-100/60 blur-3xl"></div>
          <div className="absolute -left-[10%] top-[15%] h-[60%] w-[45%] rounded-full bg-sky-50 blur-3xl"></div>
        </div>

        <section
          id="platform"
          className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]"
        >
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
              </span>
              Nền tảng quản trị hiện đại
            </div>

            <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              Hệ thống quản lý nhân sự và{' '}
              <span className="relative inline-block text-blue-500">
                tiền lương
                <svg
                  className="absolute -bottom-1 left-0 -z-10 h-3 w-full text-blue-200"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,10 Q50,20 100,10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mb-10 text-lg leading-relaxed text-slate-600 md:text-xl">
              Quản lý nhân sự, chấm công, bảng lương và báo cáo trong một nền tảng duy nhất.
              Tối ưu hóa quy trình, tiết kiệm thời gian và nâng cao trải nghiệm nhân viên.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full bg-blue-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 hover:bg-blue-600 hover:shadow-xl"
              >
                Đăng nhập để sử dụng
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
              >
                <PlayCircle className="h-5 w-5" />
                Xem Dashboard demo
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-6 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Đồng bộ thời gian thực
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Bảo mật cao
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-6 rounded-[32px] bg-gradient-to-tr from-blue-100/80 to-sky-50/70 blur-2xl"></div>

            <div className="relative overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_24px_70px_rgba(37,99,235,0.16)]">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-white/85 px-5 py-4 backdrop-blur">
                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                <div className="h-3 w-3 rounded-full bg-green-400"></div>
                <span className="ml-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  HR Payroll Preview
                </span>
              </div>

              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                <video
                  src="/video/useplink.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/20 via-transparent to-blue-500/10"></div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent px-6 py-5 text-white">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/90">
                      Demo giao diện
                    </p>
                    <p className="mt-2 text-lg font-semibold">Theo dõi vận hành trong một màn hình trực quan</p>
                  </div>
                  <div className="hidden rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur sm:inline-flex">
                    Realtime Preview
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-white/70 bg-white/95 p-4 shadow-xl shadow-slate-200/60 backdrop-blur md:block">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Luồng công việc liền mạch</p>
                  <p className="text-xs text-slate-500">Từ chấm công đến bảng lương</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="relative z-10 mx-auto mt-20 max-w-7xl lg:mt-24">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-500">
              Tính năng trọng tâm
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Tối ưu vận hành nhân sự mà vẫn giữ giao diện sáng, dễ dùng
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {featureCards.map((feature) => (
              <article
                key={feature.title}
                className="rounded-[24px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur transition-all hover:-translate-y-1 hover:border-blue-100 hover:shadow-[0_22px_48px_rgba(37,99,235,0.12)]"
              >
                <div className="mb-4 h-11 w-11 rounded-2xl bg-blue-50"></div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
