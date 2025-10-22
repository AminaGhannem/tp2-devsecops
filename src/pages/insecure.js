export default function handler(req, res) {
  // Fix: never execute user input with eval.
  // If you need to allow specific actions, implement an allowlist.
  const allowed = {
    hello: () => "Hello world",
    time: () => new Date().toISOString()
  };

  const cmd = req.query.cmd;
  if (!cmd) return res.end("no command");

  if (typeof cmd === 'string' && allowed[cmd]) {
    const result = allowed[cmd]();
    return res.end(String(result));
  } else {
    // refuse unknown/unsafe commands
    res.status(400).end("Invalid or disallowed command");
  }
}
