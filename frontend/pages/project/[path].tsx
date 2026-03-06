import Link from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';
import {
  BugIcon,
  GithubIcon,
  projectIcons,
  StarIcon,
  WatchIcon,
} from '../../components/Icons';
import { projects, ProjectData } from '../../utils/projectsData';

type ProjectPageData = ProjectData & {
  description: string;
  html_url: string;
  open_issues: number;
  subscribers_count: number;
  stargazers_count: number;
};

type ProjectPageProps = {
  project: ProjectPageData;
};

function Project({ project }: ProjectPageProps) {
  const Icon = projectIcons[project.id];

  return (
    <div className="project">
      <aside>
        <h3>You can deploy...</h3>
        <ul>
          {projects.map((item) => {
            return (
              <li key={item.id}>
                <a href={`/project/${item.slug}`}>{item.name}</a>
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
          <p className="description">{project.description}</p>
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
  const paths = projects.map((item) => ({
    params: { path: item.slug },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<ProjectPageProps> = async ({
  params,
}) => {
  const path = typeof params?.path === 'string' ? params.path : '';
  const project = projects.find((item) => item.slug === path);

  if (!project) {
    return {
      notFound: true,
    };
  }

  const res = await fetch(`https://api.github.com/repos/${project.path}`);
  const data = (await res.json()) as {
    open_issues?: number;
    subscribers_count?: number;
    stargazers_count?: number;
    description?: string;
    html_url?: string;
  };

  const enrichedProject: ProjectPageData = {
    ...project,
    open_issues: data.open_issues ?? 0,
    subscribers_count: data.subscribers_count ?? 0,
    stargazers_count: data.stargazers_count ?? 0,
    description: data.description ?? '',
    html_url: data.html_url ?? '',
  };

  return { props: { project: enrichedProject } };
};

export default Project;
