// DEMO ONLY: vulnérabilité volontaire pour le TP
export default function handler(req, res) {
  const code = req.query.cmd || ""
  // Semgrep devrait signaler 'use of eval'
  eval(code)
  res.end("executed")
}
