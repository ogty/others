<script lang="ts">
  export let url: string;
  export let title = '';
</script>

<iframe src="about:blank" srcdoc={`<script src='${url}.js'><${""}/script>`} {title}></iframe>
