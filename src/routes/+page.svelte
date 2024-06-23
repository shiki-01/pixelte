<div class="drag" />
<main>
	<h1>Welcome to SvelteKit</h1>
	<p>
		Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a>
		to read the documentation
	</p>
</main>

<style>
	:global(body) {
		margin: 0;
	}

	.drag {
		width: 100%;
		height: 2em;
		-webkit-app-region: drag;
	}

	main {
		text-align: center;
		margin-top: 100px;
	}

	h1 {
		color: #333;
	}

	p {
		color: #666;
	}
</style>
