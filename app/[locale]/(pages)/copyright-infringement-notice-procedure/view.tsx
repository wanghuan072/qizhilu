"use client"

import { SiteSettings } from "@/lib/types"
import React from "react"

interface CopyrightNoticeContentProps {
	siteConfig: SiteSettings
}

export default function CopyrightNoticeContent({
	siteConfig,
}: CopyrightNoticeContentProps) {
	const siteName = siteConfig.siteName || ""
	const contactEmail = siteConfig.contactEmail || ""
	const domain = siteConfig.domain || ""
	const lastUpdated = new Date().toISOString().split("T")[0]

	return (
		<div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
			<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
				Copyright Infringement Notice Procedure
			</h1>

			<div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
				Last Updated: {lastUpdated}
			</div>

			<div className="prose dark:prose-invert max-w-none">
				<p>
					{siteName} respects the intellectual property rights of others and
					expects users to do the same. We comply with the Digital Millennium
					Copyright Act (DMCA) and will respond to valid notices of copyright
					infringement.
				</p>

				<h2>Filing a DMCA Notice</h2>
				<p>
					If you believe that content on {siteName} infringes your copyright,
					you may submit a DMCA takedown notice. Your notice must include the
					following information:
				</p>
				<ul>
					<li>
						<strong>Identification of the copyrighted work:</strong> A
						description of the copyrighted work that you claim has been
						infringed, or if multiple copyrighted works are covered by a single
						notification, a representative list of such works.
					</li>
					<li>
						<strong>Identification of the infringing material:</strong> A
						description of where the material that you claim is infringing is
						located on our website, with enough detail that we can locate it
						(e.g., the URL or other specific location).
					</li>
					<li>
						<strong>Contact information:</strong> Your address, telephone
						number, and email address where we can contact you.
					</li>
					<li>
						<strong>Good faith statement:</strong> A statement that you have a
						good faith belief that the disputed use is not authorized by the
						copyright owner, its agent, or the law.
					</li>
					<li>
						<strong>Accuracy statement:</strong> A statement, made under penalty
						of perjury, that the above information in your notice is accurate
						and that you are the copyright owner or authorized to act on the
						copyright owner's behalf.
					</li>
					<li>
						<strong>Physical or electronic signature:</strong> A physical or
						electronic signature of the copyright owner or a person authorized
						to act on their behalf.
					</li>
				</ul>

				<h2>How to Submit Your Notice</h2>
				<p>Send your DMCA takedown notice to:</p>
				<div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
					<p>
						<strong>Email:</strong> {contactEmail}
					</p>
					<p>
						<strong>Subject Line:</strong> DMCA Takedown Notice - {siteName}
					</p>
				</div>

				<h2>Response Time</h2>
				<p>
					We will review and respond to valid DMCA notices within 24-72 hours of
					receipt. If the notice is valid and complete, we will remove or
					disable access to the allegedly infringing content.
				</p>

				<h2>Counter-Notification</h2>
				<p>
					If you believe that content you posted was removed or disabled as a
					result of a mistake or misidentification, you may file a
					counter-notification. Your counter-notification must include:
				</p>
				<ul>
					<li>Your physical or electronic signature</li>
					<li>
						Identification of the content that was removed and its location
						before removal
					</li>
					<li>
						A statement under penalty of perjury that you have a good faith
						belief the content was removed as a result of mistake or
						misidentification
					</li>
					<li>
						Your name, address, telephone number, and a statement that you
						consent to the jurisdiction of the federal court in your district
					</li>
				</ul>

				<h2>Repeat Infringers</h2>
				<p>
					{siteName} has a policy of terminating the accounts of users who are
					repeat copyright infringers in accordance with the DMCA and other
					applicable laws.
				</p>

				<h2>False Claims</h2>
				<p>
					Please note that filing a false DMCA notice may result in legal
					liability. Before submitting a notice, please ensure that you have a
					good faith belief that the use of the content is not authorized.
				</p>

				<h2>Contact Information</h2>
				<p>For all copyright-related inquiries, please contact us at:</p>
				<div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
					<p>
						<strong>Email:</strong> {contactEmail}
					</p>
					<p>
						<strong>Website:</strong> {domain}
					</p>
				</div>

				<h2>Disclaimer</h2>
				<p>
					This page provides general information about our copyright policy and
					is not legal advice. For specific legal questions, please consult with
					a qualified attorney.
				</p>
			</div>
		</div>
	)
}
