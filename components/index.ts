/**
 * Barrel export file for all custom components
 * Import components from '@/components' for cleaner imports
 */

// Layout & Navigation
export { Navigation } from "./navigation";
export { Providers } from "./providers";

// Page Components
export { PageHeader } from "./page-header";
export { SectionHeader } from "./section-header";

// Problem Components
export { ProblemCard } from "./problem-card";
export { ProblemForm, type ProblemFormValues } from "./problem-form";
export { ProblemSkeleton, ProblemSkeletonList } from "./problem-skeleton";

// Pattern Components
export { PatternBadge } from "./pattern-badge";
export { PatternCard, PatternCardSkeleton, PatternCardSkeletonGrid } from "./pattern-card";
export { CreatePatternDialog } from "./create-pattern-dialog";

// Stats & Display
export { StatsCard, StatsGrid } from "./stats-card";
export { EmptyState } from "./empty-state";
export { LoadingSpinner } from "./loading-spinner";

// Dialogs
export { ConfirmDialog } from "./confirm-dialog";

// Landing Page Components
export { FeatureCard } from "./feature-card";
export { StepCard } from "./step-card";
