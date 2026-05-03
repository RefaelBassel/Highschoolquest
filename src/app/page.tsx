import { QuestProvider } from "@/lib/quest-context";
import { QuestApp } from "@/components/QuestApp";

export default function Home() {
  return (
    <QuestProvider>
      <QuestApp />
    </QuestProvider>
  );
}
