import heroCar from '@/assets/hero-car.jpg';

interface CompanyPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function CompanyPageHeader({ eyebrow, title, description }: CompanyPageHeaderProps) {
  return (
    <section className="relative min-h-[260px] sm:min-h-[320px] flex items-end overflow-hidden">
      <img
        src={heroCar}
        alt="Showroom Phạm Gia Auto"
        className="absolute inset-0 h-full w-full object-cover saturate-50 grayscale-[20%]"
      />
      <div className="absolute inset-0 bg-[#17191d]/75 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
      <div className="container relative z-10 px-4 py-10 sm:py-14 text-white">
        <p className="mb-2 text-sm font-semibold uppercase text-primary-light">{eyebrow}</p>
        <h1 className="max-w-3xl text-3xl font-bold sm:text-4xl md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm text-white/85 sm:text-base">{description}</p>
      </div>
    </section>
  );
}
