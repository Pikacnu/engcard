export default function TOS() {
	return (
		<div className='flex flex-col items-center py-8 bg-gray-700 w-full flex-grow'>
			<h1 className='text-3xl font-bold text-white'>Terms of Service</h1>
			<main className='flex flex-col items-start mt-6 w-full max-w-4xl px-6 text-gray-300 overflow-y-auto max-h-[calc(100vh-200px)]'>
				<section className='mb-6'>
					<h2 className='text-xl font-semibold text-white'>1. Introduction</h2>
					<p className='mt-2'>
						Welcome to our flashcard app! By using our services, you agree to
						these terms. Please take a moment to read them carefully.
					</p>
					<p className='mt-2'>
						Our app is designed to enhance your learning experience, whether
						you&#39;re a student, professional, or lifelong learner. We aim to
						provide tools that help you learn and retain information
						effectively.
					</p>
					<p className='mt-2'>
						By accessing or using our app, you confirm that you have read,
						understood, and agreed to these terms. If you do not agree, we
						kindly ask you to refrain from using our services.
					</p>
				</section>
				<section className='mb-6'>
					<h2 className='text-xl font-semibold text-white'>
						2. User Responsibilities
					</h2>
					<p className='mt-2'>
						As a user, you are responsible for maintaining the confidentiality
						of your account and ensuring all activities under your account
						comply with these terms.
					</p>
					<p className='mt-2'>
						Our app is a tool to assist your learning, not a replacement for
						your efforts. Use it responsibly and as a complement to your study
						practices.
					</p>
					<p className='mt-2'>
						You must not attempt to disrupt, attack, or undermine the integrity
						of the app or its services. Responsible usage in compliance with
						applicable laws and regulations is expected.
					</p>
					<p className='mt-2'>
						While we strive to ensure the app&#39;s accuracy and reliability, it
						is your responsibility to verify the information and use it
						appropriately within your learning context.
					</p>
					<p className='mt-2'>
						We encourage you to report any bugs, vulnerabilities, or issues you
						encounter to help us improve the app and maintain its security.
					</p>
				</section>
				<section className='mb-6'>
					<h2 className='text-xl font-semibold text-white'>
						3. Prohibited Activities
					</h2>
					<p className='mt-2'>
						To maintain a safe and respectful environment, you agree not to
						misuse the app. This includes, but is not limited to, unauthorized
						access, data scraping, or distributing harmful content.
					</p>
					<p className='mt-2'>
						You must not use the app to transmit inappropriate, offensive, or
						illegal content, such as hate speech, discriminatory remarks, or
						explicit material. Such actions may result in legal consequences.
					</p>
					<p className='mt-2'>
						Uploading irrelevant or malicious content, such as spam or malware,
						is strictly prohibited. Additionally, any attempts to harm the
						app&#39;s functionality, such as overloading the system or
						exploiting vulnerabilities, are forbidden.
					</p>
					<p className='mt-2'>
						Refrain from actions that could damage the app&#39;s reputation,
						such as spreading false information or making defamatory statements.
						We reserve the right to investigate and take appropriate action,
						including account suspension or termination, for any prohibited
						activities.
					</p>
				</section>
				<section className='mb-6'>
					<h2 className='text-xl font-semibold text-white'>4. Termination</h2>
					<p className='mt-2'>
						We reserve the right to terminate your access to the app at any time
						for violations of these terms. Reasons for termination may include:
					</p>
					<ul className='list-disc list-inside mt-2'>
						<li>Engaging in prohibited activities outlined in Section 3.</li>
						<li>Misusing the app for unauthorized purposes.</li>
						<li>Attempting to disrupt or harm the app&#39;s functionality.</li>
						<li>
							Uploading or distributing malicious or inappropriate content.
						</li>
						<li>
							Violating applicable laws or regulations while using the app.
						</li>
					</ul>
					<p className='mt-2'>
						Termination may occur without prior notice, and we are not liable
						for any loss of data or access resulting from such actions.
					</p>
				</section>
				<p className='mt-4'>
					If you have any questions or need further assistance, please contact
					us at{' '}
					<a
						href='mailto:pika@mail.pikacnu.com'
						className='text-blue-400 underline'
					>
						pika@mail.pikacnu.com
					</a>
					. We value your feedback and are here to help.
				</p>
			</main>
		</div>
	);
}
