"use client"

import { SiteSettings } from "@/lib/types"
import React, { useState } from "react"

interface ContactUsContentProps {
	siteConfig: SiteSettings
}

interface FormData {
	name: string
	email: string
	subject: string
	message: string
}

export default function ContactUsContent({
	siteConfig,
}: ContactUsContentProps) {
	const siteName = siteConfig.siteName || ""
	const contactEmail = siteConfig.contactEmail || ""
	const domain = siteConfig.domain || ""
	const contactApiEndpoint = process.env.NEXT_PUBLIC_CONTACT_API_ENDPOINT
	const contactProjectId = process.env.NEXT_PUBLIC_PROJECT_ID
	const isContactConfigured = Boolean(
		contactEmail && contactApiEndpoint && contactProjectId,
	)

	const [formData, setFormData] = useState<FormData>({
		name: "",
		email: "",
		subject: "",
		message: "",
	})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitStatus, setSubmitStatus] = useState<
		"idle" | "success" | "error"
	>("idle")
	const [errorMessage, setErrorMessage] = useState("")

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		setSubmitStatus("idle")
		setErrorMessage("")

		try {
			if (!contactApiEndpoint || !contactProjectId || !contactEmail) {
				throw new Error("Contact form is not configured")
			}

			const response = await fetch(contactApiEndpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...formData,
					projectId: contactProjectId,
					siteName,
					domain,
					timestamp: new Date().toISOString(),
				}),
			})

			if (response.ok) {
				setSubmitStatus("success")
				setFormData({
					name: "",
					email: "",
					subject: "",
					message: "",
				})
			} else {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
		} catch (error) {
			console.error("Error submitting form:", error)
			setSubmitStatus("error")
			setErrorMessage(
				"Failed to send message. Please try again or contact us directly via email.",
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="max-w-4xl mx-auto">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8 mb-8">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
					Contact Us
				</h1>

				<div className="prose dark:prose-invert max-w-none mb-8">
					<p className="text-lg leading-relaxed">
						We'd love to hear from you! Whether you have questions, feedback,
						suggestions, or need support, our team is here to help. Get in touch
						with us using the form below or through our direct contact
						information.
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-8">
					{/* Contact Form */}
					<div>
						<h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
							Send us a Message
						</h2>

						{!isContactConfigured ? (
							<div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 rounded-lg">
								The contact form is temporarily unavailable while the new site
								contact details are being configured.
							</div>
						) : (
							<>
								{submitStatus === "success" && (
									<div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-300 rounded-lg">
										Thank you for your message! We'll get back to you as soon as
										possible.
									</div>
								)}

								{submitStatus === "error" && (
									<div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded-lg">
										{errorMessage}
									</div>
								)}

								<form onSubmit={handleSubmit} className="space-y-4">
									<div>
										<label
											htmlFor="name"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
										>
											Name *
										</label>
										<input
											type="text"
											id="name"
											name="name"
											value={formData.name}
											onChange={handleInputChange}
											required
											className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
											placeholder="Your full name"
										/>
									</div>

									<div>
										<label
											htmlFor="email"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
										>
											Email *
										</label>
										<input
											type="email"
											id="email"
											name="email"
											value={formData.email}
											onChange={handleInputChange}
											required
											className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
											placeholder="your.email@example.com"
										/>
									</div>

									<div>
										<label
											htmlFor="subject"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
										>
											Subject *
										</label>
										<select
											id="subject"
											name="subject"
											value={formData.subject}
											onChange={handleInputChange}
											required
											className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
										>
											<option value="">Select a subject</option>
											<option value="general">General Inquiry</option>
											<option value="technical">Technical Support</option>
											<option value="feedback">Feedback</option>
											<option value="bug-report">Bug Report</option>
											<option value="game-suggestion">Game Suggestion</option>
											<option value="partnership">Partnership</option>
											<option value="copyright">Copyright Issue</option>
											<option value="other">Other</option>
										</select>
									</div>

									<div>
										<label
											htmlFor="message"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
										>
											Message *
										</label>
										<textarea
											id="message"
											name="message"
											value={formData.message}
											onChange={handleInputChange}
											required
											rows={6}
											className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
											placeholder="Please describe your inquiry in detail..."
										/>
									</div>

									<button
										type="submit"
										disabled={isSubmitting}
										className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
									>
										{isSubmitting ? "Sending..." : "Send Message"}
									</button>
								</form>
							</>
						)}
					</div>

					{/* Contact Information */}
					<div>
						<h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
							Get in Touch
						</h2>

						<div className="space-y-4">
							{contactEmail && (
								<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
									<h3 className="font-semibold text-gray-900 dark:text-white mb-2">
										Email
									</h3>
									<p className="text-gray-600 dark:text-gray-300">
										<a
											href={`mailto:${contactEmail}`}
											className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
										>
											{contactEmail}
										</a>
									</p>
								</div>
							)}

							<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
								<h3 className="font-semibold text-gray-900 dark:text-white mb-2">
									Website
								</h3>
								<p className="text-gray-600 dark:text-gray-300">
									<a
										href={domain}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
									>
										{domain}
									</a>
								</p>
							</div>
						</div>

						<div className="mt-6">
							<h3 className="font-semibold text-gray-900 dark:text-white mb-3">
								Follow Us
							</h3>
							<div className="flex space-x-4">
								{siteConfig.socialLinks?.twitter && (
									<a
										href={siteConfig.socialLinks.twitter}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-500 hover:text-blue-600"
									>
										Twitter
									</a>
								)}
								{siteConfig.socialLinks?.facebook && (
									<a
										href={siteConfig.socialLinks.facebook}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-700"
									>
										Facebook
									</a>
								)}
								{siteConfig.socialLinks?.youtube && (
									<a
										href={siteConfig.socialLinks.youtube}
										target="_blank"
										rel="noopener noreferrer"
										className="text-red-600 hover:text-red-700"
									>
										YouTube
									</a>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
