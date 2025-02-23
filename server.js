const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    try {
        console.log('收到请求:', req.body);

        const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-iajzypncpvyughhyptuhvdcflonmuwbvhdkdfdhycasvebwi',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                model: "deepseek-ai/DeepSeek-V3",
                messages: [{
                    role: "user",
                    content: req.body.messages[0].content
                }],
                stream: false,
                max_tokens: 512,
                temperature: 0.7,
                top_p: 0.7,
                top_k: 50,
                frequency_penalty: 0.5,
                n: 1,
                response_format: {
                    type: "text"
                }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('硅基流动API错误:', response.status, errorText);
            throw new Error(`硅基流动API返回错误: ${response.status}`);
        }

        const data = await response.json();
        console.log('硅基流动API响应:', data);
        
        // 修改响应格式处理
        if (data.choices && data.choices[0] && data.choices[0].message) {
            res.json({
                choices: [{
                    message: {
                        content: data.choices[0].message.content
                    }
                }]
            });
        } else {
            throw new Error('API响应格式不正确');
        }
    } catch (error) {
        console.error('代理服务器错误:', error);
        res.status(500).json({ 
            error: error.message,
            details: error.stack 
        });
    }
});

// 添加测试路由
app.get('/test', (req, res) => {
    res.json({ message: '代理服务器正常运行' });
});

// 添加登出路由
app.post('/logout', (req, res) => {
    res.json({ success: true });
});

app.listen(3000, () => {
    console.log('代理服务器运行在 http://localhost:3000');
}); 