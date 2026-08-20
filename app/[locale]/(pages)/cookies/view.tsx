"use client"

import { SiteSettings } from "@/lib/types/api-types"
import React from "react"

interface CookiePolicyContentProps {
	siteConfig: SiteSettings
}

export default function CookiePolicyContent({
	siteConfig,
}: CookiePolicyContentProps) {
	const siteName = siteConfig.siteName || ""
	const contactEmail = siteConfig.contactEmail || ""
	const lastUpdated = new Date().toISOString().split("T")[0] // Current date in YYYY-MM-DD format

	return (
		<div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
			<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
				Cookie Policy
			</h1>

			<div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
				Last Updated: {lastUpdated}
			</div>

			<div className="prose dark:prose-invert max-w-none">
				<p>
					This Cookie Policy explains how {siteName} ("we", "us", or "our") uses
					cookies and similar technologies on our website. This policy is
					designed to help you understand what cookies are, how we use them, and
					the choices you have regarding their use.
				</p>

				<h2>What Are Cookies?</h2>
				<p>
					Cookies are small text files that are placed on your device when you
					visit a website. They are widely used to make websites work more
					efficiently and provide information to the website owners. Cookies can
					be "persistent" or "session" cookies. Persistent cookies remain on
					your device when you go offline, while session cookies are deleted as
					soon as you close your web browser.
				</p>

				<h2>How We Use Cookies</h2>
				<p>We use cookies for several purposes, including:</p>
				<ul>
					<li>
						<strong>Essential Cookies:</strong> These cookies are necessary for
						the website to function properly. They enable basic functions like
						page navigation and access to secure areas of the website. The
						website cannot function properly without these cookies.
					</li>
					<li>
						<strong>Preference Cookies:</strong> These cookies allow the website
						to remember choices you make (such as your language preference or
						your login information) and provide enhanced, more personalized
						features.
					</li>
					<li>
						<strong>Analytics Cookies:</strong> These cookies help us understand
						how visitors interact with our website by collecting and reporting
						information anonymously. This helps us improve the way our website
						works.
					</li>
					<li>
						<strong>Marketing Cookies:</strong> These cookies are used to track
						visitors across websites. The intention is to display ads that are
						relevant and engaging for the individual user.
					</li>
				</ul>

				<h2>Types of Cookies We Use</h2>
				<p>We use both first-party and third-party cookies on our website:</p>
				<ul>
					<li>
						<strong>First-party cookies:</strong> These are cookies that are set
						by our website directly.
					</li>
					<li>
						<strong>Third-party cookies:</strong> These are cookies that are set
						by third parties, such as Google Analytics, to help us track usage
						patterns on our website or to serve personalized advertisements.
					</li>
				</ul>

				<h2>Specific Cookies We Use</h2>
				<p>Here are some of the specific cookies we use and their purposes:</p>
				<ul>
					<li>
						<strong>Authentication cookies:</strong> These cookies help us
						identify you when you log in to our website and remember your login
						information.
					</li>
					<li>
						<strong>Security cookies:</strong> These cookies help us detect and
						prevent security risks.
					</li>
					<li>
						<strong>Preference cookies:</strong> These cookies store your
						preferences, such as language settings and display preferences.
					</li>
					<li>
						<strong>Analytics cookies:</strong> We use Google Analytics to
						collect information about how visitors use our website. These
						cookies collect information in an anonymous form, including the
						number of visitors to the website, where visitors have come to the
						website from, and the pages they visited.
					</li>
				</ul>

				<h2>Managing Cookies</h2>
				<p>
					Most web browsers allow you to manage your cookie preferences. You can
					set your browser to refuse cookies, or to alert you when cookies are
					being sent. The methods for doing so vary from browser to browser, and
					from version to version. You can however obtain up-to-date information
					about blocking and deleting cookies via these links:
				</p>
				<ul>
					<li>
						<a
							href="https://support.google.com/chrome/answer/95647"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Google Chrome"
						>
							Google Chrome
						</a>
					</li>
					<li>
						<a
							href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Mozilla Firefox"
						>
							Mozilla Firefox
						</a>
					</li>
					<li>
						<a
							href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Microsoft Edge"
						>
							Microsoft Edge
						</a>
					</li>
					<li>
						<a
							href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Safari"
						>
							Safari
						</a>
					</li>
				</ul>
				<p>
					Please note that blocking cookies may impact your experience on our
					website, as some features may not function properly.
				</p>

				<h2>Changes to This Cookie Policy</h2>
				<p>
					We may update our Cookie Policy from time to time. We will notify you
					of any changes by posting the new Cookie Policy on this page and
					updating the "Last Updated" date at the top of this policy.
				</p>
				<p>
					You are advised to review this Cookie Policy periodically for any
					changes. Changes to this Cookie Policy are effective when they are
					posted on this page.
				</p>

				<h2>Contact Us</h2>
				<p>
					If you have any questions about our Cookie Policy, please contact us
					at {contactEmail}.
				</p>
			</div>
		</div>
	)
}
