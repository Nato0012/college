export default async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const { username, data } = req.body;
        const token = process.env.GITHUB_PAT;
        const repo = 'nato0012/college';
        const path = `user/${username}.json`;
        const content = Buffer.from(JSON.stringify(data)).toString('base64');

        // 1. Check if file exists to get SHA
        let sha = null;
        const existingResponse = await fetch(
            `https://api.github.com/repos/${repo}/contents/${path}`,
            {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (existingResponse.ok) {
            const existingData = await existingResponse.json();
            sha = existingData.sha;
        } else if (existingResponse.status !== 404) {
            throw new Error(`GitHub API error: ${existingResponse.statusText}`);
        }

        // 2. Create/update file
        const response = await fetch(
            `https://api.github.com/repos/${repo}/contents/${path}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update GPA data for ${username}`,
                    content: content,
                    sha: sha // Will be null for new files
                }),
            }
        );

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'GitHub API error');
        }

        return res.status(200).json({ 
            success: true,
            html_url: result.content.html_url
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            solution: 'If updating, ensure file exists and PAT has write access'
        });
    }
};
