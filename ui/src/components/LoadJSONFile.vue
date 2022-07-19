<template>
  <div class="field">
    <div class="file is-centered is-primary has-name is-boxed my-4">
      <label class="file-label">
        <input
          class="file-input"
          type="file"
          name="textfile"
          accept=".json"
          @change="onFileSelected"
        />
        <span class="file-cta">
          <span class="file-icon">
            <font-awesome-icon icon="file-alt" />
          </span>
          <span class="file-label">
            Select json file to continue notating
          </span>
        </span>
      </label>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "LoadTextFile",
  emits: ["file-loaded"],
  methods: {
    ...mapActions(["continueNotatingJSONFile"]),
    onFileSelected(e) {
      let files = e.target.files;
      if (!files.length) return;

      let reader = new FileReader();
      reader.addEventListener("load", (event) => {
        this.continueNotatingJSONFile(event.target.result);
        this.$emit("file-loaded");
      });
      reader.readAsText(files[0]);
    },
  },
};
</script>

