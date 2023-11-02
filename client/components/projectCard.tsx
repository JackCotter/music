import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import styles from "@/styles/components/projectCard.module.scss";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Card className={styles.projectCard}>
      <CardContent>
        <Stack direction="row" spacing={2}>
          <Typography variant="h5" component="div">
            {project.projectname}
          </Typography>
          <Typography variant="body2">
            {project.lookingfor?.map((instrument) => (
              <Chip
                label={instrument}
                // className={styles.instrumentChip}
              />
            ))}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
