/**
 * 岩土案例题批改器 - 后端服务器
 * 提供静态文件服务 + AI 批改 API 代理
 *
 * 启动:
 *   DEEPSEEK_API_KEY=sk-xxx node server.js
 *   或复制 .env.example 为 .env 填入密钥
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.DEEPSEEK_API_KEY;
const API_BASE_URL = process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com/v1';
const MODEL_NAME = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

if (!API_KEY) {
  console.error('⚠  请先设置环境变量 DEEPSEEK_API_KEY');
  console.error('   export DEEPSEEK_API_KEY=sk-xxx');
  console.error('   或创建 .env 文件: DEEPSEEK_API_KEY=sk-xxx');
  process.exit(1);
}

// 静态文件
app.use(express.static(path.join(__dirname)));

// 批改 API
app.post('/api/grade', async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: '题目和答案不能为空' });
  }

  const systemPrompt = `你是一位注册岩土工程师考试的资深阅卷专家，熟悉所有岩土工程相关规范和考试评分标准。

你的任务是对用户的岩土工程案例计算题进行批改。请严格按照以下格式输出：

## 批改结果

**判断：**[正确/部分正确/错误]

**你的答案：**[复述用户答案]

**正确答案：**[给出正确答案和数值]

## 标准解题步骤

[按步骤详细列出标准解题过程，每步标明：
1. 使用的公式（标注规范编号和条文号）
2. 参数取值及依据
3. 代入计算过程
4. 每步的中间结果]

## 你的问题

[如果答案错误，逐条指出：
- 哪一步出错了
- 错误原因是什么（公式用错/参数取错/计算错误/单位遗漏）
- 正确做法应该是什么]

## 规范依据

[列出本题涉及的主要规范条文]

## 考试提醒

[给出1-2条考试相关的实用提醒，如高频扣分点、易错点等]

【重要格式要求】
所有数学公式必须使用 LaTeX 格式，用 $$ 包裹独立成行，用 $ 包裹行内公式。例如：
- 独立公式：$$f_a = f_{ak} + \\eta_b \\cdot \\gamma \\cdot (b-3) + \\eta_d \\cdot \\gamma_m \\cdot (d-0.5)$$
- 行内公式：重度 $\\gamma = 18 \\text{kN/m}^3$
- 希腊字母用 \\gamma、\\eta、\\phi、\\theta、\\beta、\\pi 等
- 下标用 f_{ak}、\\eta_b 等
- 不要使用纯文本表示公式，一律用 LaTeX`;

  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `题目：\n${question}\n\n我的答案：\n${answer}` }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = `API 请求失败 (${response.status})`;
      try {
        const errJson = JSON.parse(errText);
        errMsg += `: ${errJson.error?.message || errText}`;
      } catch (e) {}
      return res.status(500).json({ error: errMsg });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '未获取到回复';
    return res.json({ content });
  } catch (err) {
    console.error('API 调用失败:', err.message);
    res.status(500).json({ error: 'AI 服务暂时不可用，请稍后重试' });
  }
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║     岩土案例题批改器 已启动                ║
║     http://localhost:${PORT}              ║
╠═══════════════════════════════════════════╣
║  API: ${API_BASE_URL}              ║
║  模型: ${MODEL_NAME}                     ║
╚═══════════════════════════════════════════╝
`);
});
