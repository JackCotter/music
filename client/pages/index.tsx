import { listProject, pagecountProject } from "@/utils/apiUtils";
import {
  Pagination,
  Grid,
  Stack,
  Typography,
  TextField,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import ProjectCard from "@/components/projectCard";
import styles from "@/styles/pages/index.module.scss";
import InstrumentTypeSelect from "@/components/instrumentTypeSelect";
import { useAuthContext } from "@/contexts/authContext";

export default function Home() {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [errorBar, setErrorBar] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: "" });
  const { isAuthenticated } = useAuthContext();

  const getProjectList = async () => {
    try {
      const filteredProjectList = await listProject({
        page: page,
        instruments: selectedInstruments,
        q: debouncedSearchQuery,
      });
      setProjectList(filteredProjectList);
    } catch (error) {
      setErrorBar({ isOpen: true, message: "Error loading projects." });
    }
  };

  const getPageCount = async () => {
    try {
      const pageCount = await pagecountProject({
        instruments: selectedInstruments,
        q: debouncedSearchQuery,
      });
      setPageCount(pageCount);
      setPage(1);
    } catch (error) {
      setErrorBar({ isOpen: true, message: "Error loading projects." });
    }
  };

  useEffect(() => {
    if (page === 1) {
      // if page is already at 1, refetch the project list. If not, this will be done automatically when page is set back to 1.
      getProjectList();
    }
    getPageCount();
  }, [selectedInstruments, debouncedSearchQuery]);

  useEffect(() => {
    getProjectList();
  }, [page]);

  useEffect(() => {
    //debounce searchQuery so that it searches once user stops typing
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  return (
    <div className={styles.indexContainer}>
      {errorBar.isOpen ? (
        <Alert severity="error">{errorBar.message ?? "An error occured"}</Alert>
      ) : (
        <>
          {page === 1 && !isAuthenticated && (
            <Stack direction="column" className={styles.titleRow} spacing={4}>
              <Typography className={styles.title} variant="h3" component="div">
                Find a project to contribute to!
              </Typography>
              <Typography className={styles.info} variant="h5" component="div">
                Welcome to{" "}
                {process.env.NEXT_PUBLIC_APP_NAME ?? "Project Tracker"}! This
                platform is designed to connect musicians and encourage the
                creation of colaborative tracks. Go ahead, click on one of the
                tracks below to see what the community has already made!
              </Typography>
            </Stack>
          )}
          <Stack direction="row" alignItems="center">
            <TextField
              variant="outlined"
              label="Search"
              onChange={(event) => {
                setSearchQuery(event.target.value);
              }}
              value={searchQuery}
            />
            <InstrumentTypeSelect
              selectedInstruments={selectedInstruments}
              setSelectedInstruments={setSelectedInstruments}
            />
          </Stack>
          <Grid
            className={styles.gridContainer}
            container
            direction="row"
            spacing={2}
          >
            {projectList.map((project) => (
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
            <Pagination
              count={pageCount}
              page={page}
              onChange={handlePageChange}
            />
          </Stack>
        </>
      )}
    </div>
  );
}
