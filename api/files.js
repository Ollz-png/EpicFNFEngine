import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { path = '', raw } = req.query;

  const USERNAME = 'Ollz-png';
  const REPO = 'EpicFNFEngine';
  const BRANCH = 'main';

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};

  let url = `https://api.github.com/repos/${USERNAME}/${REPO}/contents/public/files/${path}?ref=${BRANCH}`;

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const data = await response.json();

    if (raw) {
      // If raw=true, return actual file content
      if (data.type === 'file') {
        const fileResponse = await fetch(data.download_url, { headers });
        const buffer = await fileResponse.arrayBuffer();
        const contentType = data.type === 'file' ? data.name.split('.').pop() : 'application/octet-stream';
        res.setHeader('Content-Type', 'application/octet-stream');
        return res.status(200).send(Buffer.from(buffer));
      } else {
        return res.status(400).json({ error: 'Not a file' });
      }
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
