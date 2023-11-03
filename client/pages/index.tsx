import { listProject } from "@/utils/apiUtils";
import { Button, Grid } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProjectCard from "@/components/projectCard";
import styles from "@/styles/pages/index.module.scss";
import InstrumentTypeSelect from "@/components/instrumentTypeSelect";

export default function Home() {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [filteredProjectList, setFilteredProjectList] = useState<Project[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);

  useEffect(() => {
    const filteredProjectList = projectList.filter((project) =>
      project.lookingfor?.some((instrument) =>
        selectedInstruments.includes(instrument)
      )
    );
    setFilteredProjectList(filteredProjectList);
  }, [selectedInstruments]);

  useEffect(() => {
    const getProjectList = async () => {
      const projectList = await listProject();
      setProjectList(projectList);
      setFilteredProjectList(projectList);
    };

    getProjectList();
  }, []);

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
        {filteredProjectList.map((project) => (
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
