# @mdehub/vue

Vue composables for `@mdehub/core`.

```vue
<script setup lang="ts">
import { useImageCompressor } from '@mdehub/vue'

const { compress, status, result } = useImageCompressor({ quality: 80 })
</script>
```
