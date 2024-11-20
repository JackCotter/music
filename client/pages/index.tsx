import { listProject, pagecountProject } from "@/utils/apiUtils";
import { Pagination, Grid, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ProjectCard from "@/components/projectCard";
import styles from "@/styles/pages/index.module.scss";
import InstrumentTypeSelect from "@/components/instrumentTypeSelect";

export default function Home() {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [filteredProjectList, setFilteredProjectList] = useState<Project[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

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
      try {
        const projectList = await listProject();
        const pageCount = await pagecountProject();
        setProjectList(projectList);
        setPageCount(pageCount);
        setFilteredProjectList(projectList);
      } catch (error) {
        console.error("Error fetching project list", error);
      }
    };

    getProjectList();
  }, []);

  useEffect(() => {
    const getProjectList = async () => {
      try {
        const projectList = await listProject(page);
        setProjectList(projectList);
        setFilteredProjectList(projectList);
      } catch (error) {
        console.error("Error fetching project list", error);
      }
    };

    getProjectList();
  }, [page]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  return (
    <div className={styles.indexContainer}>
      <Stack direction="row" className={styles.titleRow}>
        <Typography className={styles.title} variant="h3" component="div">
          Find a project to contribute to!
        </Typography>
      </Stack>
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
          <Grid
            className={styles.gridItem}
            key={project.projectid}
            item
            xs={12}
            sm={6}
            md={6}
            lg={4}
            xl={3}
          >
            <ProjectCard
              project={project}
              highlightedInstruments={selectedInstruments}
              setHighlightedInstruments={setSelectedInstruments}
            />
          </Grid>
        ))}
      </Grid>
      <Stack direction="row" justifyContent="center" alignItems="center">
        <Pagination count={pageCount} page={page} onChange={handlePageChange} />
      </Stack>
    </div>
  );
}
