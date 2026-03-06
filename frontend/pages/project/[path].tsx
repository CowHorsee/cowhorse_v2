import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from 'next';
import Link from 'next/link';
import {
  BugIcon,
  GithubIcon,
  StarIcon,
  WatchIcon,
  projectIcons,
} from '../../components/Icons';
import {
  projects,
  type ProjectGithubFields,
  type ProjectStats,
  type ProjectWithStats,
} from '../../utils/projectsData';

type ProjectPageProps = {
  project: ProjectWithStats;
};

type GithubRepoResponse = ProjectStats & ProjectGithubFields;

function ProjectPage({
  project,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const Icon = projectIcons[project.id];

  return (
    <div className="project">
      <aside>
        <h3>You can deploy...</h3>
        <ul>
          {projects.map((projectItem) => {
            return (
              <li key={projectItem.id}>
                <a href={`/project/${projectItem.slug}`}>{projectItem.name}</a>
              </li>
            );
          })}

          <li>
            <Link href="/">
              <a>Home</a>
            </Link>
          </li>
        </ul>
      </aside>
      <main>
        <div className="card-big">
          <Icon w={249} h={278} />
          <div className="stats">
            <div className="stats-details">
              <div>
                <StarIcon w={18} h={18} />
                <p>{project.stargazers_count}</p>
              </div>
              <p>stars</p>
            </div>
            <div className="stats-details">
              <div>
                <WatchIcon w={18} h={18} />
                <p>{project.subscribers_count}</p>
              </div>
              <p>watchers</p>
            </div>
            <div className="stats-details">
              <div>
                <BugIcon w={18} h={18} />
                <p>{project.open_issues}</p>
              </div>
              <p>issues</p>
            </div>
          </div>
          <p className="description">
            {project.description ?? 'No description available.'}
          </p>
          <div className="cta">
            <a
              className="button-github"
              href={project.html_url}
              target="_blank"
              rel="noreferrer"
            >
              <GithubIcon w={24} h={24} />
              Learn more...
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = projects.map((project) => ({
    params: { path: project.slug },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<ProjectPageProps> = async ({
  params,
}) => {
  const pathParam = params?.path;
  const pathValue = Array.isArray(pathParam) ? pathParam[0] : pathParam;
  const project = projects.find(
    (projectItem) => projectItem.slug === pathValue
  );

  if (!project) {
    return { notFound: true };
  }

  const res = await fetch(`https://api.github.com/repos/${project.path}`);
  const data = (await res.json()) as GithubRepoResponse;

  return {
    props: {
      project: {
        ...project,
        description: data.description,
        html_url: data.html_url,
        open_issues: data.open_issues,
        subscribers_count: data.subscribers_count,
        stargazers_count: data.stargazers_count,
      },
    },
  };
};

export default ProjectPage;
