import { goto } from '$app/navigation';

export function logout() {
	console.log('Logging out...')
	goto('/login');
}
