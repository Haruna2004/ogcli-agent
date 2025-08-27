#!/usr/bin/env node
import { ChatSession } from "./chat/chat";

async function main() {
  const chat = new ChatSession();
  await chat.start();
}

main();
