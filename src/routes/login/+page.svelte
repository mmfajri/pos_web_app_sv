<script lang="ts">
	import { goto } from '$app/navigation';

	let username: string = '';
	let password: string = '';

	function handleLogin(event: Event) {
		event.preventDefault();
		console.log('Logging in:', { username, password });

		goto('/dashboard');
	}
</script>

<h1>Login</h1>

<form on:submit={handleLogin}>
	<label>
		Username :
		<input type="text" bind:value={username} required />
	</label>
	<br />
	<label>
		Password :
		<input type="password" bind:value={password} required />
	</label>
	<br />
	<button type="submit">Log In</button>
</form>
