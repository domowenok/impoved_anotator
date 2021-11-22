const niceColors = [
  "#eeff96",
  "#bdff96",
  "#96ffee",
  "#96bbff",
  "#be96ff",
  "#ef96ff",
  "#ff96d2",
  "#ff9696",
  "#ffd596",
];
export const actions = {
  continueNotatingJSONFile(context, payload){
    // prepare data
    const data = JSON.parse(payload)
    let text = '';
    for (let i = 0; i < data.annotations.length; i++){
      // raw text block part 1
      text = text + data.annotations[i][0].trim() +  " ";
      if (i + 1 < data.annotations.length){
        text += '\n'
      }
      // class block
      if(data.annotations[i][1].entities.length){
        context.commit('addClass', data.annotations[i][1].entities[0][2])
        console.dir(data.annotations[i][1].entities[0][2])
      }
      // annotation block
      context.commit('addAnnotation', data.annotations[i]);
    }
    // raw text block part 2
    context.commit('setInputSentences', text)
    context.state.isJSON = true;
    // console.dir(data.annotations)
    //ready text
    // console.dir(data.annotations[0][0])
    // ready entities
    // console.dir(data.annotations[0][1].entities)
    // ready first entities [0, 1, 2]
    // console.dir(data.annotations[0][1].entities[0])
    // console.dir(context.state.classes)
  }
}

export const mutations = {
  // continueNotatingJSONFile(state, payload){
  //   // prepare data
  //   const data = JSON.parse(payload)
  //   //classes
  //   for (let i = 0; i < data.annotations.length; i++){
  //
  //   }
  //   state.annotations.push(data)
  //   console.dir(data.annotations)
  //   //ready text
  //   console.dir(data.annotations[0][0])
  //   // ready entities
  //   console.dir(data.annotations[0][1].entities)
  //   // ready first entities [0, 1, 2]
  //   console.dir(data.annotations[0][1].entities[0])
  // },
  setInputSentences(state, payload) {
    if (!Array.isArray(payload)) {
      state.originalText = payload;
      payload = payload.split(state.separator);
    }
    state.inputSentences = payload.map((s, i) => ({ id: i, text: s }));
  },
  addClass(state, payload) {
    let existing = state.classes.find((c) => c.name == payload);
    if (existing) {
      return;
    }
    let lastIndex = state.classes.reduce((p, c) => {
      return c.id > p ? c.id : p;
    }, 0);
    state.classes.push({
      id: lastIndex + 1,
      name: payload,
      color: niceColors[lastIndex % niceColors.length],
    });
    if (state.classes.length === 1) {
      state.currentClass = state.classes[0];
    }
  },
  removeClass(state, payload) {
    state.classes = state.classes.filter((c) => c.id != payload);
    if (state.currentClass.id === payload) {
      state.currentClass = state.classes[0];
    }
  },
  setCurrentClass(state, payload) {
    state.currentClass = state.classes.find((c) => c.id === payload);
  },
  findClass(state, payload){
    const data = state.classes.find((cl) => cl.name === payload);
    state.targetClass = data
  },
  addAnnotation(state, payload) {
    state.annotations.push(payload);
  },
  changeAnnotation(state, payload) {
    console.dir(payload)
    state.annotations[payload.index] = payload.data;
  },
  setSeparator(state, payload) {
    state.separator = payload;
    const sentences = state.originalText.split(state.separator);
    state.inputSentences = sentences.map((s, i) => ({ id: i, text: s }));
  },
};

export const getters = {};
export default {
  state() {
    return {
      originalText: "",
      separator: "\n",
      classes: [],
      inputSentences: [],
      annotations: [],
      currentClass: {},
      targetClass: {},
      isJSON: false,
    };
  },
  getters,
  mutations,
  actions,
};
