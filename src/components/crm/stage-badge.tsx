import { Badge } from "@/components/ui/badge";
import { stageLabels } from "@/lib/labels";

const variants = {
  LEAD: "secondary",
  PROSPECT: "outline",
  CUSTOMER: "default",
  CHURNED: "destructive",
} as const;

export function StageBadge({ stage }: { stage: string }) {
  const variant = variants[stage as keyof typeof variants] ?? "secondary";
  return <Badge variant={variant}>{stageLabels[stage] ?? stage}</Badge>;
}
