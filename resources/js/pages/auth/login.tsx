import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
/* @chisel-registration */
import { register } from '@/routes';
/* @end-chisel-registration */
import { store } from '@/routes/login';
import { request } from '@/routes/password';
/* @chisel-passkeys */
import PasskeyVerify from '@/components/passkey-verify';
/* @end-chisel-passkeys */

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk - Disputatio AI" />

            {/* @chisel-passkeys */}
            <PasskeyVerify />
            {/* @end-chisel-passkeys */}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-4">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-medium text-neutral-300">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    className="h-10 rounded-xl bg-[#18181b] border-[#27272a] text-sm text-white focus:border-neutral-400 placeholder:text-neutral-500"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-medium text-neutral-300">
                                        Kata Sandi
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs text-neutral-400 hover:text-white transition-colors"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Masukkan kata sandi"
                                    className="h-10 rounded-xl bg-[#18181b] border-[#27272a] text-sm text-white focus:border-neutral-400 placeholder:text-neutral-500"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center space-x-2 pt-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="rounded border-[#3f3f46] data-[state=checked]:bg-white data-[state=checked]:text-black"
                                />
                                <Label htmlFor="remember" className="text-xs text-neutral-400 font-normal cursor-pointer select-none">
                                    Ingat saya
                                </Label>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full h-10 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors shadow-none mt-2"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <>
                                        <Spinner className="mr-2 size-4" />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <span>Masuk</span>
                                )}
                            </Button>
                        </div>

                        {/* Register link */}
                        <div className="text-neutral-400 text-center text-xs pt-2">
                            Belum memiliki akun?{' '}
                            <TextLink href={register()} tabIndex={6} className="text-white font-medium hover:underline">
                                Daftar
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-medium text-emerald-400">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Masuk ke Akun',
    description: 'Masukkan email dan kata sandi Anda untuk melanjutkan.',
};
