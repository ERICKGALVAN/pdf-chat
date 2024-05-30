import { createContext, useEffect, useState } from "react";
import pdfService from "../services/pdf";
import { TestInterface } from "../interfaces/test_interface";

const PdfContext = createContext(
  {} as {
    isNew: boolean;
    setIsNew: (isNew: boolean) => void;
    file: File | null;
    changeFile: (file?: File | null) => void;
    isLoading: boolean;
    upLoadPdf: (file: File) => void;
    makeQuestion: (question: string, reference: string) => void;
    documents: any[] | null;
    getDocuments: () => void;
    chooseFile: (id: string) => void;
    currentDocument: any | null;
    chat: Chat[];
    isThinking: boolean;
    getLlms: () => void;
    llms: string[];
    currentLlm: string | null;
    changeLLM: (llm: string) => void;
    testMode: boolean;
    setTestMode: (testMode: boolean) => void;
    testInfo: Array<TestInterface> | null;
    numberTest: number;
  }
);

interface Chat {
  by: string;
  text: string;
}

export function PdfProvider({ children }: { children: React.ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [documents, setDocuments] = useState<any[] | null>(null);
  const [currentDocument, setCurrentDocument] = useState<any | null>(null);
  const [chat, setChat] = useState<Chat[]>([]);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [llms, setLlms] = useState<string[]>([]);
  const [currentLlm, setCurrentLlm] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [testInfo, setTestInfo] = useState<Array<TestInterface> | null>(null);
  const [testInfoAux, setTestInfoAux] = useState<Array<TestInterface> | null>(
    null
  );
  const [numberTest, setNumberTest] = useState<number>(0);

  useEffect(() => {
    getDocuments();
    getLlms();
  }, []);

  const uploadPdf = async (file: File) => {
    setIsLoading(true);
    const doc = await pdfService.upLoadPdf(file);
    setCurrentDocument(doc);
    setChat([]);
    setIsLoading(false);
  };

  const makeQuestion = async (question: string, reference: string | null) => {
    setChat((prevChat) => [...prevChat, { by: "user", text: question }]);
    setIsThinking(true);
    const data = await pdfService.makeQuestion(
      question,
      currentDocument.id,
      currentLlm!,
      testMode,
      reference ?? null
    );
    if (data["test"]) {
      const test = data["test"];
      if (testInfo) {
        setTestInfoAux(test);
        testInfo.forEach((element) => {
          if (element.llm === test.llm) {
            element.bleu.bleu = (element.bleu.bleu + test.bleu.bleu) / 2;
            element.bleu.brevity_penalty =
              (element.bleu.brevity_penalty + test.bleu.brevity_penalty) / 2;
            element.bleu.length_ratio =
              (element.bleu.length_ratio + test.bleu.length_ratio) / 2;
            element.bleu.reference_length =
              (element.bleu.reference_length + test.bleu.reference_length) / 2;
            element.bleu.translation_length =
              (element.bleu.translation_length + test.bleu.translation_length) /
              2;
            element.bleu.precisions = element.bleu.precisions.map(
              (value, index) => (value + test.bleu.precisions[index]) / 2
            );
            element.bert.f1 = element.bert.f1.map(
              (value, index) => (value + test.bert.f1[index]) / 2
            );
            element.bert.precision = element.bert.precision.map(
              (value, index) => (value + test.bert.precision[index]) / 2
            );
            element.bert.recall = element.bert.recall.map(
              (value, index) => (value + test.bert.recall[index]) / 2
            );
            element.bert.hashcode = test.bert.hashcode;
            element.rouge.rouge1 =
              (element.rouge.rouge1 + test.rouge.rouge1) / 2;
            element.rouge.rouge2 =
              (element.rouge.rouge2 + test.rouge.rouge2) / 2;
            element.rouge.rougeL =
              (element.rouge.rougeL + test.rouge.rougeL) / 2;
            element.rouge.rougeLsum =
              (element.rouge.rougeLsum + test.rouge.rougeLsum) / 2;
          }
        });
      }
      setTestInfo(test);
      setNumberTest(numberTest + 1);
    }

    const aiMessage = data["chat_history"][data["chat_history"].length - 1];
    setChat((prevChat) => [...prevChat, { by: "ai", text: aiMessage["text"] }]);
    setIsThinking(false);
  };

  // const testQuestion = async (question: string, reference: string) => {
  //   setChat((prevChat) => [...prevChat, { by: "user", text: question }]);
  //   setIsThinking(true);
  //   const data = await pdfService.makeQuestion(
  //     question,
  //     currentDocument.id,
  //     currentLlm!
  //   );
  //   pdfService.testQuestion(question, reference);
  //   const aiMessage = data["chat_history"][data["chat_history"].length - 1];
  //   pdfService.testQuestion(aiMessage["text"], reference);
  //   setChat((prevChat) => [...prevChat, { by: "ai", text: aiMessage["text"] }]);
  //   setIsThinking(false);
  //   console.log(chat);
  // };

  const getDocuments = async () => {
    const data = await pdfService.getDocuments();
    setDocuments(data.documents);
  };

  const changeFile = (file?: File | null) => {
    setIsNew(true);
    setFile(file ?? null);
  };

  const chooseFile = async (id: string) => {
    setIsNew(false);
    const bytes = await pdfService.getBytes(id);
    console.log(bytes);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const file = new File([blob], "file.pdf", { type: "application/pdf" });
    setFile(file);
  };

  const getLlms = async () => {
    const data = await pdfService.getLlms();
    setLlms(data.llms);
    setCurrentLlm(data.llms[0]);
  };

  const changeLLM = (llm: string) => {
    setCurrentLlm(llm);
  };

  return (
    <PdfContext.Provider
      value={{
        isNew,
        setIsNew,
        file,
        changeFile,
        isLoading: isLoading,
        upLoadPdf: uploadPdf,
        makeQuestion,
        documents: documents ?? [],
        getDocuments,
        chooseFile,
        currentDocument,
        chat,
        isThinking,
        getLlms,
        llms,
        currentLlm,
        changeLLM,
        testMode,
        setTestMode,
        testInfo,
        numberTest,
      }}
    >
      {children}
    </PdfContext.Provider>
  );
}

export default PdfContext;
