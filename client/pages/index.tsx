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
    if (selectedInstruments.length === 0) {
      setFilteredProjectList(projectList);
      return;
    }
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
          <Grid key={project.projectid} item xs={15} md={6} lg={4} xl={3}>
            <ProjectCard
              project={project}
              highlightedInstruments={selectedInstruments}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
