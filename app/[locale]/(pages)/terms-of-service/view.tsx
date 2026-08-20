"use client"

import { SiteSettings } from "@/lib/types"
import React from "react"

interface TermsContentProps {
	siteConfig: SiteSettings
}

export default function TermsContent({ siteConfig }: TermsContentProps) {
	const siteName = siteConfig.siteName || ""
	const contactEmail = siteConfig.contactEmail || ""
	const lastUpdated = new Date().toISOString().split("T")[0] // Current date in YYYY-MM-DD format

	return (
		<div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
			<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
				Terms of Service
			</h1>

			<div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
				Last Updated: {lastUpdated}
			</div>

			<div className="prose dark:prose-invert max-w-none">
				<p>
					Welcome to {siteName}. By accessing our website, you agree to be bound
					by these Terms of Service. Please read them carefully.
				</p>

				<h2>1. Acceptance of Terms</h2>
				<p>
					By accessing or using {siteName} (the "Service"), you agree to be
					bound by these Terms of Service ("Terms"). If you do not agree to all
					of these Terms, you may not access or use the Service.
				</p>

				<h2>2. Changes to Terms</h2>
				<p>
					We reserve the right to modify these Terms at any time. We will
					provide notice of any material changes by posting the new Terms on the
					Service and updating the "Last Updated" date. Your continued use of
					the Service after such changes constitutes your acceptance of the new
					Terms.
				</p>

				<h2>3. Using Our Service</h2>
				<p>
					You agree to use the Service only for lawful purposes and in
					accordance with these Terms. You agree not to:
				</p>
				<ul>
					<li>
						Use the Service in any way that violates any applicable law or
						regulation.
					</li>
					<li>
						Use the Service to transmit any material that is defamatory,
						obscene, or otherwise objectionable.
					</li>
					<li>
						Attempt to interfere with, compromise the system integrity or
						security, or decipher any transmissions to or from the servers
						running the Service.
					</li>
					<li>
						Use any robot, spider, crawler, scraper, or other automated means to
						access the Service.
					</li>
					<li>
						Bypass measures we may use to prevent or restrict access to the
						Service.
					</li>
				</ul>

				<h2>4. User Accounts</h2>
				<p>
					When you create an account with us, you must provide accurate,
					complete, and current information. You are responsible for
					safeguarding the password you use to access the Service and for any
					activities or actions under your account.
				</p>
				<p>
					We reserve the right to disable any user account if, in our opinion,
					you have violated any provision of these Terms.
				</p>

				<h2>5. Intellectual Property</h2>
				<p>
					The Service and its original content, features, and functionality are
					and will remain the exclusive property of {siteName} and its
					licensors. The Service is protected by copyright, trademark, and other
					laws of both the United States and foreign countries.
				</p>
				<p>
					Our trademarks and trade dress may not be used in connection with any
					product or service without the prior written consent of {siteName}.
				</p>

				<h2>6. User Content</h2>
				<p>
					Our Service may allow you to post, link, store, share, and otherwise
					make available certain information, text, graphics, videos, or other
					material ("User Content"). You are responsible for the User Content
					that you post on or through the Service, including its legality,
					reliability, and appropriateness.
				</p>
				<p>
					By posting User Content on or through the Service, you grant us the
					right to use, modify, publicly perform, publicly display, reproduce,
					and distribute such content on and through the Service. You retain any
					and all of your rights to any User Content you submit, post, or
					display on or through the Service and you are responsible for
					protecting those rights.
				</p>

				<h2>7. Links to Other Websites</h2>
				<p>
					Our Service may contain links to third-party websites or services that
					are not owned or controlled by {siteName}.
				</p>
				<p>
					{siteName} has no control over, and assumes no responsibility for, the
					content, privacy policies, or practices of any third-party websites or
					services. You further acknowledge and agree that {siteName} shall not
					be responsible or liable, directly or indirectly, for any damage or
					loss caused or alleged to be caused by or in connection with the use
					of or reliance on any such content, goods, or services available on or
					through any such websites or services.
				</p>

				<h2>8. Termination</h2>
				<p>
					We may terminate or suspend your account immediately, without prior
					notice or liability, for any reason whatsoever, including without
					limitation if you breach the Terms.
				</p>
				<p>
					Upon termination, your right to use the Service will immediately
					cease. If you wish to terminate your account, you may simply
					discontinue using the Service.
				</p>

				<h2>9. Limitation of Liability</h2>
				<p>
					In no event shall {siteName}, nor its directors, employees, partners,
					agents, suppliers, or affiliates, be liable for any indirect,
					incidental, special, consequential, or punitive damages, including
					without limitation, loss of profits, data, use, goodwill, or other
					intangible losses, resulting from:
				</p>
				<ul>
					<li>
						Your access to or use of or inability to access or use the Service;
					</li>
					<li>Any conduct or content of any third party on the Service;</li>
					<li>Any content obtained from the Service; and</li>
					<li>
						Unauthorized access, use, or alteration of your transmissions or
						content.
					</li>
				</ul>

				<h2>10. Disclaimer</h2>
				<p>
					Your use of the Service is at your sole risk. The Service is provided
					on an "AS IS" and "AS AVAILABLE" basis. The Service is provided
					without warranties of any kind, whether express or implied, including,
					but not limited to, implied warranties of merchantability, fitness for
					a particular purpose, non-infringement, or course of performance.
				</p>

				<h2>11. Governing Law</h2>
				<p>
					These Terms shall be governed and construed in accordance with the
					laws of the jurisdiction in which {siteName} is established, without
					regard to its conflict of law provisions.
				</p>
				<p>
					Our failure to enforce any right or provision of these Terms will not
					be considered a waiver of those rights. If any provision of these
					Terms is held to be invalid or unenforceable by a court, the remaining
					provisions of these Terms will remain in effect.
				</p>

				<h2>12. Contact Us</h2>
				<p>
					If you have any questions about these Terms, please contact us at{" "}
					{contactEmail}.
				</p>
			</div>
		</div>
	)
}
