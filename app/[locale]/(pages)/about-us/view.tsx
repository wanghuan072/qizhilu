"use client"

import { SiteSettings } from "@/lib/types"
import React from "react"

interface AboutUsContentProps {
	siteConfig: SiteSettings
}

export default function AboutUsContent({ siteConfig }: AboutUsContentProps) {
	const siteName = siteConfig.siteName || ""
	const domain = siteConfig.domain || ""
	const contactEmail = siteConfig.contactEmail || ""

	return (
		<div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
			<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
				About Us
			</h1>

			<div className="prose dark:prose-invert max-w-none">
				<p className="text-lg leading-relaxed mb-6">
					Welcome to {siteName}, your premier destination for online gaming
					entertainment. We are passionate about providing players with access
					to high-quality, engaging games that can be enjoyed instantly in your
					web browser.
				</p>

				<h2>Our Mission</h2>
				<p>
					At {siteName}, our mission is to create an accessible and enjoyable
					gaming platform where players of all ages and skill levels can
					discover, play, and share their favorite games. We believe that gaming
					should be fun, inclusive, and easily accessible to everyone.
				</p>

				<h2>What We Offer</h2>
				<ul>
					<li>
						<strong>Diverse Game Collection:</strong> We curate a wide variety
						of games across multiple genres, ensuring there's something for
						every type of player.
					</li>
					<li>
						<strong>Instant Play:</strong> All our games are browser-based,
						requiring no downloads or installations. Simply click and play!
					</li>
					<li>
						<strong>Multi-language Support:</strong> Our platform supports
						multiple languages to serve our global community of players.
					</li>
					<li>
						<strong>Regular Updates:</strong> We continuously add new games and
						features to keep our platform fresh and exciting.
					</li>
					<li>
						<strong>Safe Environment:</strong> We maintain a family-friendly
						environment with carefully selected content.
					</li>
				</ul>

				<h2>Our Values</h2>
				<div className="grid md:grid-cols-2 gap-6 my-6">
					<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
						<h3 className="font-semibold mb-2">Quality</h3>
						<p className="text-sm">
							We carefully select and test each game to ensure the highest
							quality gaming experience for our users.
						</p>
					</div>
					<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
						<h3 className="font-semibold mb-2">Accessibility</h3>
						<p className="text-sm">
							Gaming should be accessible to everyone, regardless of device,
							location, or technical expertise.
						</p>
					</div>
					<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
						<h3 className="font-semibold mb-2">Community</h3>
						<p className="text-sm">
							We foster a welcoming community where players can enjoy games in a
							safe and respectful environment.
						</p>
					</div>
					<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
						<h3 className="font-semibold mb-2">Innovation</h3>
						<p className="text-sm">
							We continuously explore new technologies and features to enhance
							the gaming experience.
						</p>
					</div>
				</div>

				<h2>Our Commitment</h2>
				<p>
					We are committed to providing a platform that respects user privacy,
					follows best practices for web security, and maintains the highest
					standards of content quality. Our team works diligently to ensure that{" "}
					{siteName} remains a trusted destination for online gaming.
				</p>

				<h2>Technology & Performance</h2>
				<p>
					Built with modern web technologies, {siteName} is optimized for
					performance across all devices and browsers. We use industry-standard
					security measures to protect our users and their data while providing
					a seamless gaming experience.
				</p>

				<h2>Contact Us</h2>
				<p>
					We love hearing from our community! Whether you have suggestions for
					new games, feedback about our platform, or just want to say hello,
					we're here to listen.
				</p>
				<div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mt-4">
					<p>
						<strong>Email:</strong> {contactEmail}
					</p>
					<p>
						<strong>Website:</strong> {domain}
					</p>
				</div>

				<h2>Join Our Community</h2>
				<p>
					Ready to start your gaming adventure? Explore our extensive collection
					of games, discover new favorites, and join thousands of players who
					have made {siteName}
					their go-to gaming destination. The fun starts now!
				</p>
			</div>
		</div>
	)
}
