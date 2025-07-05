export default async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        const { username } = req.query;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const token = process.env.GITHUB_PAT;
        const repo = 'nato0012/college';
        const path = `user/${username}.json`;

        const response = await fetch(
            `https://api.github.com/repos/${repo}/contents/${path}`,
            {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3.raw' // Important for getting raw content
                }
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({ error: 'User not found' });
            }
            throw new Error(`GitHub API: ${response.statusText}`);
        }

        const content = await response.text();
        const userData = JSON.parse(content);
        
        return res.status(200).json(userData);
        
    } catch (error) {
        return res.status(500).json({ 
            error: error.message,
            solution: 'Check if user exists and PAT has repo access'
        });
    }
};
