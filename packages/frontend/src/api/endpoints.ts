import { Flight } from "@trans-europa/common";
import apiCall from "./apiCall";

export async function addFlight(t: Flight) {
  return apiCall("POST /flight", { params: {}, body: t });
}

export async function fetchPeers() {
  return apiCall("GET /peers", { params: {}, body: null });
}
