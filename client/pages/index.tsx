import { Inter } from "next/font/google";
import Profile from "@/components/profile";

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
      <Profile />
    </div>
  );
}
