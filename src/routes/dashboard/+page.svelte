<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import { goto } from "$app/navigation";

  function logout() {
    console.log("Logging out...");
    goto("/login");
  }
</script>

<Navbar onLogout={logout}></Navbar>
<main class="p-8">
  <h1 class="text-3xl font-bold underline">TEST !!!</h1>
</main>
