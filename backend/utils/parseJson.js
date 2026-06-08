function extractJson(text) {
  try {
    // 尝试直接解析
    return JSON.parse(text);
  } catch (e) {
    // 如果直接解析失败，尝试从文本中提取 JSON 块
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.error("JSON parse error on matched block:", err.message);
        throw new Error("解析模型返回的 JSON 失败");
      }
    }
    console.error("No JSON block found in model response:", text);
    throw new Error("模型未返回合法的 JSON 格式数据");
  }
}

module.exports = { extractJson };
