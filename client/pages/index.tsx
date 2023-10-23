import { Inter } from "next/font/google";
import Project from "@/components/project";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
      }}
    >
      <Project />
    </div>
  );
}
