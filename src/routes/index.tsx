import { createFileRoute } from "@tanstack/react-router";
import TableApp from "@/components/TableApp";

export const Route = createFileRoute("/")({
  ssr: false,
  component: Home,
});

function Home() {
  return <TableApp />;
}
