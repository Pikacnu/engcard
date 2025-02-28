import { LoginMethod } from '@/type';
import { signIn } from '@/utils/auth';

export default function SignInButton({
	provider,
	className,
}: {
	provider: LoginMethod;
	className?: string;
}) {
	return (
		<form
			action={async () => {
				'use server';
				await signIn(provider, {
					redirectTo: '/',
				});
			}}
		>
			<button
				className={`p-2 m-2 text-black bg-teal-500 rounded-md ${className}`}
			>
				{provider}
			</button>
		</form>
	);
}
