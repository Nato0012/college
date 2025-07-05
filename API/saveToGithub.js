export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, data } = req.body;
    const token = process.env.GITHUB_PAT;
    const repo = 'nato0012/college';
    const path = `user/${username}.json`;
    const content = Buffer.from(JSON.stringify(data)).toString('base64');

    const response = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add GPA data for ${username}`,
          content: content,
        }),
      }
    );

    const result = await response.json();
    
    if (response.ok) {
      return res.status(200).json({ message: 'Successfully saved to GitHub' });
    } else {
      return res.status(response.status).json({ message: result.message });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
