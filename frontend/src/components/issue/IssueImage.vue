<template>
  <div class="p-sm-5">
    <img :src="imageUrl" alt="Image of character" />
  </div>
</template>

<script>
export default {
  props: ["imageUrl"]
};
</script>
