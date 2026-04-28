const buffer = require("buffer");
buffer.SlowBuffer = buffer.Buffer;
globalThis.SlowBuffer = buffer.Buffer;
