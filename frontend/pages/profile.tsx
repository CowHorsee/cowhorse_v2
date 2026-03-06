import Card from '../components/atoms/Card';

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-6xl rounded-2xl bg-brand-white p-6 shadow-surface md:p-8">
      <section className="mb-6">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-brand-red">
          User profile
        </p>
        <h1 className="font-heading text-3xl font-semibold text-brand-blue md:text-4xl">
          Hi Ashwin👋
        </h1>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card as="article" variant="base" padding="lg">
          <h3 className="font-heading text-lg font-semibold text-brand-blue">
            Account
          </h3>
          <p className="mt-3 text-sm text-slate-700">Name: Ashwin Kumar</p>
          <p className="mt-2 text-sm text-slate-700">
            Email: ashwin.kumar@cowhorse.dev
          </p>
          <p className="mt-2 text-sm text-slate-700">Role: Senior Engineer</p>
        </Card>
        <Card as="article" variant="base" padding="lg">
          <h3 className="font-heading text-lg font-semibold text-brand-blue">
            Approval settings
          </h3>
          <p className="mt-3 text-sm text-slate-700">
            Preferred category: IT Procurement
          </p>
          <p className="mt-2 text-sm text-slate-700">Notification: Instant</p>
          <p className="mt-2 text-sm text-slate-700">
            Timezone: Asia/Kuala_Lumpur
          </p>
        </Card>
      </section>
    </div>
  );
}
