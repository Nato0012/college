export default async (req, res) => {
    // Set JSON content type immediately
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            message: 'Method not allowed' 
        });
    }

    try {
        const { username, data } = req.body;
        
        if (!username || !data) {
            return res.status(400).json({
                success: false,
                message: 'Missing username or data'
            });
        }

        const token = process.env.GITHUB_PAT;
        if (!token) {
            return res.status(500).json({
                success: false,
                message: 'Server misconfigured'
            });
        }

        const repo = 'nato0012/college';
        const path = `user/${username}.json`;
        const content = Buffer.from(JSON.stringify(data)).toString('base64');

        const githubResponse = await fetch(
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

        const githubResult = await githubResponse.json();
        
        if (githubResponse.ok) {
            return res.status(200).json({ 
                success: true,
                message: 'Successfully saved to GitHub',
                url: githubResult.content.html_url
            });
        } else {
            return res.status(githubResponse.status).json({
                success: false,
                message: githubResult.message || 'GitHub API error'
            });
        }
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};
