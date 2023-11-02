import { listProject } from "@/utils/apiUtils";
import { Button, Grid } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProjectCard from "@/components/projectCard";
import styles from "@/styles/pages/index.module.scss";

export default function Home() {
  const [projectList, setProjectList] = useState<Project[]>([]);

  useEffect(() => {
    const getProjectList = async () => {
      const projectList = await listProject();
      setProjectList(projectList);
    };

    getProjectList();
  }, []);

  return (
    <Grid
      className={styles.gridContainer}
      container
      direction="row"
      spacing={2}
    >
      {projectList.map((project) => (
        <Grid key={project.projectid} item xs={4}>
          <Link href={`/project/${project.projectid}`}>
            <ProjectCard project={project} />
          </Link>
        </Grid>
      ))}
    </Grid>
  );
}
