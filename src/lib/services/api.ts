import axios from "axios";

const api = axios.create({
  baseURL: "https://acloud-br-gcp-gob-ti-iam-1028436318023.southamerica-west1.run.app",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;