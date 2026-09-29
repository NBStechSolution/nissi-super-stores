import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { signInAdmin } from '../lib/supabaseAuth';

export default function ManagementLoginForm({ onCancel, onSuccess }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (loading) return;

		setError('');
		setSuccess('');
		setLoading(true);

		try {
			await signInAdmin(email.trim(), password);

			setSuccess('Management sign-in successful!');
			setPassword('');
			onSuccess?.();
		} catch (authError) {
			setError(authError?.message || 'Management sign-in failed.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="p-3 bg-cardcream/80 border border-hairline rounded-xl space-y-3 animate-fade-in"
		>
			<div className="flex items-center justify-between">
				<h2 className="text-sm font-bold text-ink flex items-center gap-2">
					<Lock className="w-4 h-4 text-forest" />
					Management Sign In
				</h2>

				{onCancel && (
					<button
						type="button"
						onClick={onCancel}
						className="text-xs text-ink-soft hover:text-ink"
					>
						Cancel
					</button>
				)}
			</div>

			{error && (
				<div
					role="alert"
					className="p-2 bg-kumkum/10 text-kumkum text-xs rounded-lg"
				>
					{error}
				</div>
			)}

			{success && (
				<div
					role="status"
					className="p-2 bg-forest/10 text-forest text-xs rounded-lg"
				>
					{success}
				</div>
			)}

			<input
				type="email"
				required
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="Management email"
				autoComplete="username"
				className="w-full px-3 py-2.5 bg-paper rounded-lg border border-hairline text-xs focus:outline-none focus:border-forest"
			/>

			<input
				type="password"
				required
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="Password"
				autoComplete="current-password"
				className="w-full px-3 py-2.5 bg-paper rounded-lg border border-hairline text-xs focus:outline-none focus:border-forest"
			/>

			<button
				type="submit"
				disabled={loading}
				className="w-full px-3 py-2.5 bg-forest text-paper text-xs font-bold rounded-lg hover:bg-forest-soft disabled:opacity-60"
			>
				{loading ? 'Signing in...' : 'Sign In'}
			</button>
		</form>
	);
}
