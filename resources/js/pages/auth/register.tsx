import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Daftar - Disputatio AI" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-medium text-neutral-300">
                                    Nama Lengkap
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Nama lengkap Anda"
                                    className="h-10 rounded-xl bg-[#18181b] border-[#27272a] text-sm text-white focus:border-neutral-400 placeholder:text-neutral-500"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-medium text-neutral-300">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="nama@email.com"
                                    className="h-10 rounded-xl bg-[#18181b] border-[#27272a] text-sm text-white focus:border-neutral-400 placeholder:text-neutral-500"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-xs font-medium text-neutral-300">
                                    Kata Sandi
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Minimal 8 karakter"
                                    passwordrules={passwordRules}
                                    className="h-10 rounded-xl bg-[#18181b] border-[#27272a] text-sm text-white focus:border-neutral-400 placeholder:text-neutral-500"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation" className="text-xs font-medium text-neutral-300">
                                    Konfirmasi Kata Sandi
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Ulangi kata sandi"
                                    passwordrules={passwordRules}
                                    className="h-10 rounded-xl bg-[#18181b] border-[#27272a] text-sm text-white focus:border-neutral-400 placeholder:text-neutral-500"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-10 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors shadow-none mt-2"
                                tabIndex={5}
                                disabled={processing}
                                data-test="register-user-button"
                            >
                                {processing ? (
                                    <>
                                        <Spinner className="mr-2 size-4" />
                                        <span>Mendaftarkan...</span>
                                    </>
                                ) : (
                                    <span>Daftar Akun</span>
                                )}
                            </Button>
                        </div>

                        {/* Login Link */}
                        <div className="text-neutral-400 text-center text-xs pt-2">
                            Sudah memiliki akun?{' '}
                            <TextLink href={login()} tabIndex={6} className="text-white font-medium hover:underline">
                                Masuk
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Daftar Akun Baru',
    description: 'Lengkapi data di bawah untuk membuat akun baru.',
};
