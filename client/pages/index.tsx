import { listProject } from "@/utils/apiUtils";
import { Button, Grid } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProjectCard from "@/components/projectCard";
import styles from "@/styles/pages/index.module.scss";
import InstrumentTypeSelect from "@/components/instrumentTypeSelect";

export default function Home() {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);

  useEffect(() => {
    const getProjectList = async () => {
      const projectList = await listProject();
      setProjectList(projectList);
    };

    getProjectList();
  }, []);

  console.log(selectedInstruments);
  return (
    <>
      <InstrumentTypeSelect
        selectedInstruments={selectedInstruments}
        setSelectedInstruments={setSelectedInstruments}
      />
      <Grid
        className={styles.gridContainer}
        container
        direction="row"
        spacing={2}
      >
        {projectList.map((project) => (
          <Grid key={project.projectid} item xs={4}>
            <Link href={`/project/${project.projectid}`}>
              <ProjectCard
                project={project}
                highlightedInstruments={selectedInstruments}
              />
            </Link>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
