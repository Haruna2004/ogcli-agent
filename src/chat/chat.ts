import ora from "ora";
import inquirer from "inquirer";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

type Message = {
  content: string;
  role: string;
};

export class ChatSession {
  private conversation: Message[] = [];

  constructor() {}

  async start() {
    const spinner = ora();

    while (true) {
      const userInput = await this.getChatInput();

      if (userInput.toLowerCase() === "/exit") {
        console.log("Goodbye!");
        break;
      }

      if (!userInput) {
        continue;
      }

      this.conversation.push({ role: "user", content: userInput });
      spinner.text = "Procesing...";
      spinner.color = "magenta";
      spinner.start();

      const { text } = await this.startAgent(this.conversation);

      spinner.stop();

      if (text) {
        console.log(`\n● ${text}\n`);
        this.conversation.push({ role: "assistant", content: text });
      }
    }
  }

  async startAgent(messages: Message[]) {
    const result = await client.chat.completions.create({
      messages: messages as any,
      model: "openai/gpt-oss-20b",
    });
    const text = result.choices[0]?.message.content;

    return { text };
  }

  async getChatInput(): Promise<string> {
    const { input } = await inquirer.prompt([
      {
        type: "input",
        name: "input",
        message: "> ",
      },
    ]);

    return input;
  }
}
