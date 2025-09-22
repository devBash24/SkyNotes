import { Buffer } from "buffer"

if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = Buffer
}

if (typeof globalThis.global === "undefined") {
  // amazon-cognito-identity-js expects a Node-like global object
  globalThis.global = globalThis
}
