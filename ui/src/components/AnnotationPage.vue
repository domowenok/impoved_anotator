<template>
  <div class="columns is-desktop">
    <div class="column is-one-fifth">
      <AnnotationSidebar :current="currentSentence" />
    </div>
    <div class="column">
      <div class="panel m-4">
        <div class="panel-heading">
          <classes-block />
        </div>
        <div class="panel-block">
          <div id="editor">
            <component
              :is="t.type === 'token' ? 'Token' : 'TokenBlock'"
              :id="'t' + t.start"
              v-for="t in tm.tokens"
              :token="t"
              :key="t.start"
              :backgroundColor="t.backgroundColor"
              @remove-block="onRemoveBlock"
            />
          </div>
        </div>
        <div class="panel-block">
          <div class="field is-grouped">
            <p class="control">
              <button class="button" @click = 'goToPreviousSentence' >Go Back</button>
            </p>
            <p class="control">
              <button class="button is-link" @click="saveTags(1)">Save</button>
            </p>
            <p class="control">
              <button class="button is-danger is-outlined" @click="resetBlocks">
                Reset
              </button>
            </p>
            <!-- <p class="control">
              <button class="button" @click="skipCurrentSentence">Skip</button>
            </p> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState} from "vuex";
import axios from "../axios";
import Token from "./Token";
import TokenBlock from "./TokenBlock";
import AnnotationSidebar from "./AnnotationSidebar";
import ClassesBlock from "./ClassesBlock.vue";
import TokenManager from "./token-manager";

export default {
  name: "AnnotationPage",
  data: function() {
    return {
      tm: new TokenManager([]),
      currentSentence: {},
      currentIndex: 0,
      redone: "",
    };
  },
  components: {
    Token,
    TokenBlock,
    AnnotationSidebar,
    ClassesBlock,
  },
  computed: {
    ...mapState(["inputSentences", "classes", "annotations", "currentClass", 'targetClass', 'isJSON']),
  },
  watch: {
    inputSentences() {
      this.currentIndex = 0;
      this.tokenizeCurrentSentence();
    }

  },
  created() {
    if (this.isJSON){
      this.restoreAnnotationValues();
    }
    else if (this.inputSentences.length) {
      this.tokenizeCurrentSentence();
    }
    document.addEventListener("mouseup", this.selectTokens);
  },
  beforeUnmount() {
    document.removeEventListener("mouseup", this.selectTokens);
  },
  methods: {
    async tokenizeCurrentSentence() {
      if (this.currentIndex >= this.inputSentences.length) {
        // TODO show completed message
        alert("You have completed all the sentences")
        return;
      }
      this.currentSentence = this.inputSentences[this.currentIndex];
      await axios
        .post("/tokenize", this.currentSentence)
        .then((res) => {
          this.tm = new TokenManager(res.data.tokens);
        })
        .catch((err) => alert(err));
    },
    selectTokens() {
      let selection = document.getSelection();

      if (
        selection.anchorOffset === selection.focusOffset &&
        selection.anchorNode === selection.focusNode
      )
        return;
      let startIdx, endIdx;
      try {
        startIdx = parseInt(
          selection.anchorNode.parentElement.id.replace("t", "")
        );
        endIdx = parseInt(
          selection.focusNode.parentElement.id.replace("t", "")
        );
      } catch (e) {
        console.log("selected text were not tokens");
        return;
      }

      if (!this.classes.length && selection.anchorNode) {
        alert(
          "There are no Tags available. Kindly add some Tags before tagging."
        );
        selection.empty();
        return;
      }
      // console.log(startIdx, endIdx, this.currentClass)
      this.tm.addNewBlock(startIdx, endIdx, this.currentClass);
      selection.empty();
    },
    onRemoveBlock(blockStart) {
      this.tm.removeBlock(blockStart);
    },
    resetBlocks() {
      this.tm.resetBlocks();
    },
    // skipCurrentSentence() {
    //   this.currentIndex++;
    //   this.tokenizeCurrentSentence();
    // },
    saveTags(step) {
      try {
        const currentAnnotation = this.annotations[this.currentIndex];
        if (currentAnnotation.length){
          console.log(1)
          axios
            .post("/detokenize", { tokens: this.tm.words })
            .then((res) => {
              this.$store.commit("changeAnnotation", { data: [
                res.data.text,
                { entities: this.tm.exportAsAnnotation() },
              ],
              index: this.currentIndex
            })
              this.currentIndex += step;
              this.restoreAnnotationValues()
              return;
            })
            .catch((e) => {
              console.log(e);
              return;
            });
          }
      } catch (e) {
        axios
          .post("/detokenize", { tokens: this.tm.words })
          .then((res) => {
            this.$store.commit("addAnnotation", [
              res.data.text,
              { entities: this.tm.exportAsAnnotation() },
            ]);
            this.currentIndex += step;
            this.tokenizeCurrentSentence();
            this.restoreAnnotationValues();
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },
    goToPreviousSentence(){
      if(this.currentIndex === 0){
        console.log(this.currentIndex)
        return;
      }
      this.saveTags(-1);
    },
    async restoreAnnotationValues(){
      await this.tokenizeCurrentSentence();
      const data = this.annotations[this.currentIndex]
      if(this.annotations[this.currentIndex] && data[1].entities.length){
        // console.log(data[1].entities.length)
        try {
          if (data[1].entities.length === 1){
            const parameters = data[1].entities[0]
            this.$store.commit("findClass", parameters[2]);
            this.tm.addNewBlock(parameters[0], parameters[1], this.targetClass);
          } else {
            for (let i = 0; i < data[1].entities.length; i++){
              const parameters = data[1].entities[i]
              this.$store.commit("findClass", parameters[2]);
              this.tm.addNewBlock(parameters[0], parameters[1], this.targetClass);
            }
          }
        } catch (e) {
          console.log(e)
        }
       // setTimeout(()=>{
       //   this.tm.addNewBlock(parameters[0], parameters[1], this.currentClass);
       // }, 3000)
     }
   },
  },
};
</script>

<style lang="scss">
#editor {
  padding: 1rem;
}
</style>
