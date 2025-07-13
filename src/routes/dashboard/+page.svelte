<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import { logout } from "$lib/utils/logout";
</script>

<Navbar onLogout={logout}></Navbar>
<main class="p-2">
  <h1 class="text-3xl font-bold underline">Transaction List</h1>
</main>
