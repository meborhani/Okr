import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Target } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLogin } from './useLogin';

const schema = z.object({
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { login, loading, error } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => login(data.email, data.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/20 backdrop-blur mb-4">
            <Target size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">سیستم OKR</h1>
          <p className="text-primary-200 text-sm mt-1">مدیریت اهداف و نتایج کلیدی</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-gray-900 mb-5">ورود به سیستم</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="ایمیل"
              type="email"
              placeholder="admin@company.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="رمز عبور"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading}>
              ورود
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
