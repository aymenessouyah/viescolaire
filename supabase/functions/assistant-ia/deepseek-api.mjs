import { DEEPSEEK_RESPONSE_SCHEMAS } from "./quality.mjs";

const SUPPORTED_IMAGE_DATA_URLS = [
  "data:image/jpeg;base64,",
  "data:image/png;base64,",
  "data:image/webp;base64,",
];

export function buildDeepSeekRequestBody({
  task,
  model,
  instructions,
  userText,
  attachments = [],
  maxOutputTokens,
  temperature,
}) {
  const schema = DEEPSEEK_RESPONSE_SCHEMAS[task];
  if (!schema) throw new Error(`Tâche DeepSeek inconnue : ${task}`);

  const content = [{ type: "input_text", text: userText }];
  for (const attachment of attachments) {
    if (typeof attachment?.data !== "string") continue;
    if (!SUPPORTED_IMAGE_DATA_URLS.some(prefix => attachment.data.startsWith(prefix))) continue;
    content.push({ type: "input_image", image_url: attachment.data, detail: "original" });
  }

  return {
    model,
    instructions,
    input: [{ role: "user", content }],
    reasoning: { effort: "none" },
    max_output_tokens: maxOutputTokens,
    temperature,
    text: {
      format: {
        type: "json_schema",
        name: `agent_${task}_result`,
        schema,
      },
    },
    stream: false,
  };
}

export function extractDeepSeekContent(responseData) {
  const output = Array.isArray(responseData?.output) ? responseData.output : [];
  return output
    .filter(item => item?.type === "message" && Array.isArray(item.content))
    .flatMap(item => item.content)
    .filter(part => part?.type === "output_text" && typeof part.text === "string")
    .map(part => part.text)
    .join("");
}
