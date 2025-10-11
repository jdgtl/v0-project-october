import { ProjectOctoberLogo, ProjectOctoberWordmark, ProjectOctoberLogoFull } from "@/components/project-october-logo"

export default function LogoShowcase() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(16,185,129,0.1),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <ProjectOctoberLogo size={120} className="text-white" />
            </div>
            <h1 className="text-5xl font-light tracking-tight text-white sm:text-7xl">
              PROJECT <span className="font-semibold">OCTOBER</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              A modern financial platform for sharing and tracking transactions
            </p>
          </div>
        </div>
      </div>

      {/* Logo Variations */}
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="mb-12 text-3xl font-semibold">Logo Variations</h2>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Icon Only */}
          <div className="rounded-lg border bg-card p-8">
            <h3 className="mb-6 text-sm font-medium text-muted-foreground">Icon Only</h3>
            <div className="flex items-center justify-center gap-8">
              <ProjectOctoberLogo size={64} className="text-foreground" />
              <ProjectOctoberLogo size={48} className="text-foreground" />
              <ProjectOctoberLogo size={32} className="text-foreground" />
            </div>
          </div>

          {/* Wordmark */}
          <div className="rounded-lg border bg-card p-8">
            <h3 className="mb-6 text-sm font-medium text-muted-foreground">Wordmark</h3>
            <div className="flex items-center justify-center">
              <ProjectOctoberWordmark className="text-foreground" />
            </div>
          </div>

          {/* Full Logo - Light */}
          <div className="rounded-lg border bg-white p-8">
            <h3 className="mb-6 text-sm font-medium text-slate-600">Light Background</h3>
            <div className="flex items-center justify-center">
              <ProjectOctoberLogoFull className="h-10 text-slate-900" />
            </div>
          </div>

          {/* Full Logo - Dark */}
          <div className="rounded-lg border bg-slate-900 p-8">
            <h3 className="mb-6 text-sm font-medium text-slate-400">Dark Background</h3>
            <div className="flex items-center justify-center">
              <ProjectOctoberLogoFull className="h-10 text-white" />
            </div>
          </div>

          {/* Color Variations */}
          <div className="rounded-lg border bg-card p-8 md:col-span-2">
            <h3 className="mb-6 text-sm font-medium text-muted-foreground">Color Variations</h3>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <ProjectOctoberLogo size={48} className="text-blue-600" />
              <ProjectOctoberLogo size={48} className="text-emerald-600" />
              <ProjectOctoberLogo size={48} className="text-teal-600" />
              <ProjectOctoberLogo size={48} className="text-slate-900" />
            </div>
          </div>
        </div>

        {/* Design Notes */}
        <div className="mt-16 rounded-lg border bg-card p-8">
          <h3 className="mb-4 text-xl font-semibold">Design Concept</h3>
          <div className="space-y-4 text-muted-foreground">
            <p>The Project October logo combines geometric precision with subtle symbolism:</p>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>
                <strong className="text-foreground">The "10" Mark:</strong> October is the 10th month, represented
                through a minimalist geometric interpretation
              </li>
              <li>
                <strong className="text-foreground">Octagonal Shape:</strong> The "0" uses an octagon (8 sides),
                referencing "Oct" (Latin for eight) and October's historical position
              </li>
              <li>
                <strong className="text-foreground">Tech-Forward Aesthetic:</strong> Clean lines and geometric forms
                convey modernity and precision
              </li>
              <li>
                <strong className="text-foreground">Versatile:</strong> Works at any size, in color or monochrome, on
                light or dark backgrounds
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
