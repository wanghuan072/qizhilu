"use client"

import { SiteSettings } from "@/lib/types"
import React from "react"

interface PrivacyPolicyContentProps {
	siteConfig: SiteSettings
}

export default function PrivacyPolicyContent({
	siteConfig,
}: PrivacyPolicyContentProps) {
	const siteName = siteConfig.siteName || ""
	const contactEmail = siteConfig.contactEmail || ""
	const lastUpdated = new Date().toISOString().split("T")[0] // Current date in YYYY-MM-DD format

	return (
		<div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
			<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
				Privacy Policy
			</h1>

			<div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
				Last Updated: {lastUpdated}
			</div>

			<div className="prose dark:prose-invert max-w-none">
				<p>
					Welcome to {siteName}. We value your privacy and are committed to
					protecting your personal information. This Privacy Policy explains how
					we collect, use, disclose, and safeguard your information when you
					visit our website.
				</p>

				<h2>Information We Collect</h2>
				<p>
					When you use {siteName}, we may collect the following types of
					information:
				</p>
				<ul>
					<li>
						Personal Information: Such as your name, email address, and phone
						number, which you voluntarily provide when registering an account,
						subscribing to our newsletter, or contacting us.
					</li>
					<li>
						Usage Data: Information about how you access and use our website,
						including the pages you visit, the links you click, and how you
						interact with our services.
					</li>
					<li>
						Device Information: Technical details such as your IP address,
						browser type, operating system, and other information about how you
						access and use our services.
					</li>
					<li>
						Cookies and Similar Technologies: We use cookies and similar
						technologies to collect information about your usage of our
						services. For more details, please refer to our Cookie Policy.
					</li>
				</ul>

				<h2>How We Use Your Information</h2>
				<p>We use the information we collect for the following purposes:</p>
				<ul>
					<li>To provide, maintain, and improve our services.</li>
					<li>
						To communicate with you, including sending service notifications,
						updates, security alerts, and support messages.
					</li>
					<li>
						To personalize your experience, including showing you more relevant
						content and advertisements.
					</li>
					<li>
						To analyze and understand how users interact with our services so we
						can improve them.
					</li>
					<li>
						To comply with applicable laws and regulations and protect our
						legitimate interests.
					</li>
				</ul>

				<h2>Information Sharing</h2>
				<p>
					We do not sell your personal information. However, we may share your
					information in the following circumstances:
				</p>
				<ul>
					<li>
						Service Providers: We may share your information with third-party
						service providers who help us deliver our services, such as hosting
						providers, analytics services, and customer support services.
					</li>
					<li>
						Business Transfers: If we are involved in a merger, acquisition, or
						asset sale, your information may be transferred as part of that
						transaction.
					</li>
					<li>
						Legal Requirements: We may disclose your information if required by
						law or to protect our rights, property, or safety.
					</li>
					<li>
						With Your Consent: We may share your information in ways not
						described in this policy with your consent.
					</li>
				</ul>

				<h2>Data Security</h2>
				<p>
					We implement reasonable security measures to protect your personal
					information from unauthorized access, use, or disclosure. However, no
					method of transmission over the internet or electronic storage is 100%
					secure, so we cannot guarantee absolute security.
				</p>

				<h2>Data Retention</h2>
				<p>
					We retain your personal information for as long as necessary to
					fulfill the purposes outlined in this policy, unless a longer
					retention period is required or permitted by law.
				</p>

				<h2>Your Rights</h2>
				<p>
					Depending on your location, you may have the following rights under
					applicable laws:
				</p>
				<ul>
					<li>
						Right to Access: You have the right to access personal information
						we hold about you.
					</li>
					<li>
						Right to Rectification: You have the right to request correction of
						inaccurate or incomplete personal information.
					</li>
					<li>
						Right to Erasure: In certain circumstances, you have the right to
						request deletion of your personal information.
					</li>
					<li>
						Right to Restrict Processing: In certain circumstances, you have the
						right to request that we limit the processing of your personal
						information.
					</li>
					<li>
						Right to Object: In certain circumstances, you have the right to
						object to the processing of your personal information.
					</li>
					<li>
						Right to Data Portability: In certain circumstances, you have the
						right to receive your personal information in a structured, commonly
						used, and machine-readable format, and to transmit this information
						to another controller.
					</li>
				</ul>
				<p>
					If you wish to exercise these rights, please contact us at{" "}
					{contactEmail}.
				</p>

				<h2>Children's Privacy</h2>
				<p>
					Our services are not directed to children under 13 years of age. We do
					not knowingly collect personal information from children under 13. If
					you become aware that we may have collected personal information from
					a child under 13, please contact us promptly, and we will take steps
					to remove such information.
				</p>

				<h2>Changes to This Privacy Policy</h2>
				<p>
					We may update this Privacy Policy from time to time. When we make
					significant changes, we will post a notice on our website and update
					the "Last Updated" date at the top of this policy. We encourage you to
					review this policy periodically to stay informed about how we protect
					your information.
				</p>

				<h2>Contact Us</h2>
				<p>
					If you have any questions or concerns about this Privacy Policy,
					please contact us at {contactEmail}.
				</p>
			</div>
		</div>
	)
}
