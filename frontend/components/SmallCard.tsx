type SmallCardProps = {
  Icon: (props: { w?: number | string; h?: number | string }) => JSX.Element;
  title: string;
  slug: string;
};

export default function SmallCard({ Icon, title, slug }: SmallCardProps) {
  return (
    <a className="card-small" href={`/project/${slug}`}>
      <Icon w={153} h={163} />
      <h3>{title}</h3>
    </a>
  );
}
