export default function TOS() {
	return (
		<div className='flex flex-col items-center min-h-screen py-8 bg-gray-700 w-full'>
			<h1 className='text-3xl font-bold text-white'>Privacy Policy</h1>
			<main className='flex flex-col items-start mt-6 w-full max-w-4xl px-6 text-gray-300 overflow-y-auto max-h-[calc(100vh-200px)]'>
				<section className='mb-6'>
					<h2 className='text-2xl font-semibold text-white'>Introduction</h2>
					<p className='mt-2'>
						Your privacy is important to us. This Privacy Policy explains how we
						collect, use, and protect your information.
					</p>
				</section>
				<section className='mb-6'>
					<h2 className='text-2xl font-semibold text-white'>
						Information We Collect
					</h2>
					<p className='mt-2'>
						We may gather details such as your name, email address, and data
						related to your usage of our services. This includes insights into
						your interactions with our platform, like pages viewed, features
						accessed, and time spent on the site. This information is utilized
						to enhance our services and deliver a more tailored user experience.
					</p>
				</section>
				<section className='mb-6'>
					<h2 className='text-2xl font-semibold text-white'>
						How We Use Your Information
					</h2>
					<p className='mt-2'>
						We use your information to provide and improve our services. This
						includes ensuring the platform operates smoothly and efficiently, as
						well as enhancing your overall user experience.
					</p>
					<p className='mt-2'>
						We use your information to communicate with you. This may involve
						sending updates, responding to inquiries, or providing support to
						address any issues you encounter.
					</p>
					<p className='mt-2'>
						We use your information to ensure the security of our platform. This
						includes monitoring for suspicious activities, preventing
						unauthorized access, and maintaining the integrity of our services.
					</p>
					<p className='mt-2'>
						We will analyze user data to recommend and help you review and
						practice vocabulary. This analysis allows us to tailor content and
						suggestions to better suit your learning needs and preferences.
					</p>
				</section>
				<section className='mb-6'>
					<h2 className='text-2xl font-semibold text-white'>Your Rights</h2>
					<p className='mt-2'>
						You have the right to access, update, or delete your personal
						information. We are committed to respecting and upholding your
						rights and will make every reasonable effort to fulfill your
						requests promptly and efficiently.
					</p>
					<p className='mt-2'>
						If you wish to access your data, we will provide you with a detailed
						overview of the information we have collected about you. This
						ensures transparency and allows you to verify the accuracy of your
						personal data.
					</p>
					<p className='mt-2'>
						Should you need to update your information, we will assist you in
						making the necessary changes to ensure that your records are
						accurate and up-to-date. Keeping your information current helps us
						provide you with the best possible experience.
					</p>
					<p className='mt-2'>
						If you request the deletion of your personal data, we will do our
						utmost to remove it from our systems. However, please note that in
						certain situations, it may not be feasible to delete specific data.
						This could be due to technical limitations, legal obligations, or
						the necessity of retaining certain information for legitimate
						business purposes. In such cases, we will inform you of the reasons
						why the data cannot be deleted.
					</p>
					<p className='mt-2'>
						We value your trust and are dedicated to ensuring that your rights
						are respected. If you have any concerns or questions regarding your
						rights or the handling of your personal information, please do not
						hesitate to contact us. We are here to assist you and address any
						issues you may have.
					</p>
				</section>
				<section className='mb-6'>
					<h2 className='text-2xl font-semibold text-white'>Contact Us</h2>
					<p className='mt-2'>
						If you have any questions about this Privacy Policy, please contact
						us at{' '}
						<a
							href='mailto:pika@mail.pikacnu.com'
							className=' text-blue-600'
						>
							pika@mail.pikacnu.com
						</a>
						.
					</p>
				</section>
			</main>
		</div>
	);
}
