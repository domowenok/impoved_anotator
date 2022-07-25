import axios from "axios";

const instance = axios.create({
  baseURL: "https://arcane-sands-86804.herokuapp.com",
  timeout: 3000,
});

export default instance;
