const prodSettings = {
  baseURL: "https://" + window.location.host,
  apiURL: "",
  wsURL: "wss://" + window.location.host + "/",
};

const devSettings = {
  baseURL: "http://localhost:8080",
  apiURL: "http://localhost:8080",
  wsURL: "ws://localhost:8080/",
};

const settings =
  process.env.NODE_ENV === "production" ? prodSettings : devSettings;

export default settings;
