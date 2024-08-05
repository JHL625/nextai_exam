import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";

import { PDFLoader } from "langchain/document_loaders/fs/pdf";

const chat = async (query, filePath = "./uploads/DSA Guide.pdf") => {
  const loader = new PDFLoader(filePath);

  //promise另一种写法, 与async一对,等待loader进行完后才继续执行
  const data = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500, //  (in terms of number of characters)
    chunkOverlap: 30,
  });

  const splitDocs = await textSplitter.splitDocuments(data);

  const embeddings = new OpenAIEmbeddings({
    openAIApikey: process.env.REACT_APP_OPENAI_API_KEY,
  });

  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );

  // step 4: retrieval,step 5封装了

  // const relevantDocs = await vectorStore.similaritySearch(
  // "What is task decomposition?"
  // );

  // step 5: qa w/ customzie the prompt
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });

  const template = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer as concise as possible.

{context}
Question: {question}
Helpful Answer:`;

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    prompt: PromptTemplate.fromTemplate(template),
    // returnSourceDocuments: true,
  });

  const response = await chain.call({
    query,
  });

  return response;
};
export default chat;
