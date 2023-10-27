import { Button } from "@mui/material";
import Link from "next/link";

export default function Home() {
  const projectId = 1;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
      }}
    >
      <Link href={`/project/${projectId}`}>
        <Button variant="contained" color="secondary">
          go to project
        </Button>{" "}
      </Link>
    </div>
  );
}
