"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { profileIcon } from "../../lib/icons";

export default function ProfileMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	return (
		<div className="relative" ref={menuRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="bg-gray-400 hover:bg-gray-500 rounded-full p-1 transition-colors"
				aria-label="Profile menu"
			>
				<Image
					src={profileIcon}
					alt="Profile"
					className="w-8 h-8 cursor-pointer brightness-0 invert"
				/>
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-500">
					{/* Profile Section */}
					<div className="px-4 py-3 border-b border-gray-200">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
								<span className="text-gray-600 font-semibold text-lg">U</span>
							</div>
							<div>
								<p className="font-semibold text-gray-900">Guest User</p>
								<p className="text-sm text-gray-500">Not signed in</p>
							</div>
						</div>
					</div>

					{/* Menu Items */}
					{/* <div className="py-1"> */}
						{/* <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 flex items-center gap-3">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
							<span>My Profile</span>
						</button>

						<button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 flex items-center gap-3">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
							</svg>
							<span>Saved Places</span>
						</button>

						<button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 flex items-center gap-3">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							<span>My Events</span>
						</button>

						<button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 flex items-center gap-3">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							<span>Settings</span>
						</button>
					</div> */}

					{/* Bottom Section */}
					<div className="border-t border-gray-200 py-1">
						<button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 flex items-center gap-3">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>Help & Support</span>
						</button>

						<Link 
							href="/signin"
							className="w-full px-4 py-2 text-left hover:bg-gray-100 text-blue-600 font-medium flex items-center gap-3"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
							</svg>
							<span>Sign In</span>
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}
