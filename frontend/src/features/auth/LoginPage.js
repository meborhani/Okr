"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginPage = LoginPage;
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const zod_2 = require("zod");
const lucide_react_1 = require("lucide-react");
const Input_1 = require("@/components/ui/Input");
const Button_1 = require("@/components/ui/Button");
const useLogin_1 = require("./useLogin");
const schema = zod_2.z.object({
    email: zod_2.z.string().email('ایمیل معتبر نیست'),
    password: zod_2.z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
});
function LoginPage() {
    const { login, loading, error } = (0, useLogin_1.useLogin)();
    const { register, handleSubmit, formState: { errors }, } = (0, react_hook_form_1.useForm)({ resolver: (0, zod_1.zodResolver)(schema) });
    const onSubmit = (data) => login(data.email, data.password);
    return (<div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/20 backdrop-blur mb-4">
            <lucide_react_1.Target size={32} className="text-white"/>
          </div>
          <h1 className="text-2xl font-bold text-white">سیستم OKR</h1>
          <p className="text-primary-200 text-sm mt-1">مدیریت اهداف و نتایج کلیدی</p>
        </div>

        
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-gray-900 mb-5">ورود به سیستم</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input_1.Input label="ایمیل" type="email" placeholder="admin@company.com" error={errors.email?.message} {...register('email')}/>
            <Input_1.Input label="رمز عبور" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')}/>

            {error && (<div className="bg-danger-50 border border-danger-200 text-danger-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>)}

            <Button_1.Button type="submit" fullWidth size="lg" loading={loading}>
              ورود
            </Button_1.Button>
          </form>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=LoginPage.js.map